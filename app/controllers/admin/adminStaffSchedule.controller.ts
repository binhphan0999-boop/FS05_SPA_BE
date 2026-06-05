import { FlashType } from "@configs/enum";
import { Prisma } from "@db";
import models from "@models";
import {
  CreateStaffScheduleValidator,
  UpdateStaffScheduleValidator,
} from "@validators/admin.validator";
import { NotFoundError } from "ts-rails";
import { AdminController } from "./admin.controller";

// ============= SPA SCHEDULE CONSTANTS =============
const SPA_CONFIG = {
  WORKING_HOURS_START: "08:00", // SPA opens at 08:00
  WORKING_HOURS_END: "22:00",   // SPA closes at 22:00
  MIN_SHIFT_DURATION_MINUTES: 30,
  MAX_SHIFT_DURATION_HOURS: 12,
};

const VALID_STATUSES = ["ACTIVE", "OFF", "LEAVE"] as const;
const VALID_SHIFT_TYPES = ["MORNING", "AFTERNOON", "EVENING", "FULL_TIME"] as const;

// ============= HELPER FUNCTIONS =============
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (mins: number): string => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Helper function to parse a YYYY-MM-DD date string into a UTC Date object at midnight
const parseDateToUTCMidnight = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

// Helper function to remove diacritics (accents) from a string
const removeDiacritics = (str: string): string => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const calculateDuration = (startTime: string, endTime: string): { minutes: number; display: string } => {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const minutes = endMins - startMins;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const display = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  
  return { minutes, display };
};

const suggestShiftType = (startTime: string, endTime: string): string => {
  const { minutes } = calculateDuration(startTime, endTime);
  
  if (minutes >= 8 * 60) return "FULL_TIME";
  
  const startMins = timeToMinutes(startTime);
  const morningEnd = timeToMinutes("12:00");
  const afternoonEnd = timeToMinutes("17:00");
  const eveningEnd = timeToMinutes("22:00");
  
  if (startMins < morningEnd) return "MORNING";
  if (startMins < afternoonEnd) return "AFTERNOON";
  return "EVENING";
};

export class AdminStaffScheduleController extends AdminController {
  private readonly SORTABLE_FIELDS = [
    "workDate",
    "startTime",
    "endTime",
    "shiftType",
    "status",
    "staff", // Thêm để hỗ trợ sắp xếp theo tên nhân viên
    "createdAt",
  ];

  async index() {
    const search = String(this.req.query.search || "").trim();

    const sortBy = this.SORTABLE_FIELDS.includes(
      String(this.req.query.sortBy)
    )
      ? String(this.req.query.sortBy)
      : "workDate";

    const sortOrder = String(
      this.req.query.sortOrder || "desc"
    ) as "asc" | "desc";

    const filterStatus = String(
      this.req.query.filterStatus || ""
    );

    const page = Math.max(
      1,
      parseInt(String(this.req.query.page || "1"), 10)
    );

    const perPage = Math.min(
      50,
      Math.max(
        10,
        parseInt(String(this.req.query.perPage || "10"), 10)
      )
    );

    const where: Prisma.StaffScheduleWhereInput = {
      deleted: false,
    };

    if (search) {
      const orConditions: Prisma.StaffScheduleWhereInput[] = [];

      // 1. Thử phân tích chuỗi tìm kiếm thành ngày (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
      let parsedDate: Date | null = null;
      const dateRegexDDMMYYYY = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
      const dateRegexYYYYMMDD = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;

      let match = search.match(dateRegexDDMMYYYY);
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        // Tạo ngày UTC để nhất quán
        const tempDate = new Date(Date.UTC(year, month - 1, day));
        // Kiểm tra tính hợp lệ của ngày tháng đã parse sau khi chuyển đổi UTC
        if (tempDate.getUTCDate() === day && tempDate.getUTCMonth() === month - 1 && tempDate.getUTCFullYear() === year) {
          parsedDate = tempDate;
        } else {
          parsedDate = null;
        }
      } else {
        match = search.match(dateRegexYYYYMMDD);
        if (match) {
          const year = parseInt(match[1], 10);
          const month = parseInt(match[2], 10);
          const day = parseInt(match[3], 10);
          // Tạo ngày UTC để nhất quán
          const tempDate = new Date(Date.UTC(year, month - 1, day));
          if (tempDate.getUTCDate() === day && tempDate.getUTCMonth() === month - 1 && tempDate.getUTCFullYear() === year) {
            parsedDate = tempDate;
          } else {
            parsedDate = null;
          }
        }
      }

      if (parsedDate) {
        const nextDay = new Date(parsedDate);
        nextDay.setUTCDate(parsedDate.getUTCDate() + 1); // Tăng ngày UTC

        orConditions.push({
          workDate: {
            gte: parsedDate,
            lt: nextDay,
          },
        });
      }

      // 2. Tìm kiếm theo tên nhân viên (cải thiện cho tên nhiều từ)
      const searchWords = search.split(/\s+/).filter(word => word.length > 0);

      if (searchWords.length > 0) {
        const staffNameConditions: Prisma.UserWhereInput[] = searchWords.map(word => {
          const normalizedWord = removeDiacritics(word); // Chuỗi đã loại bỏ dấu

          // Tìm kiếm cả với chuỗi gốc và chuỗi đã loại bỏ dấu
          return {
            OR: [
              { firstName: { contains: word, mode: "insensitive" } },
              { middleName: { contains: word, mode: "insensitive" } },
              { lastName: { contains: word, mode: "insensitive" } },
              // Thêm điều kiện tìm kiếm với chuỗi đã loại bỏ dấu
              { firstName: { contains: normalizedWord, mode: "insensitive" } },
              { middleName: { contains: normalizedWord, mode: "insensitive" } },
              { lastName: { contains: normalizedWord, mode: "insensitive" } },
            ],
          };
        });

        orConditions.push({
          staff: {
            AND: staffNameConditions, // Đảm bảo tất cả các từ đều phải xuất hiện
          },
        });
      }

      // 3. Các điều kiện tìm kiếm khác (email, dịch vụ, loại ca, ghi chú)
      orConditions.push(
        {
          staff: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          Service: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          shiftType: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          note: {
            contains: search,
            mode: "insensitive",
          },
        }
      );

      where.OR = orConditions;
    }

    if (filterStatus && (VALID_STATUSES as readonly string[]).includes(filterStatus)) {
      where.status = filterStatus;
    }

    const [schedules, total, staffs] =
      await Promise.all([
        models.staffSchedule.findMany({
          where,
          include: {
            staff: {
              select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                email: true,
              },
            },
            Service: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                Appointment: true,
              },
            },
          },
          orderBy: {
            ...(sortBy === 'staff'
              ? { staff: { lastName: sortOrder, firstName: sortOrder } } // Sắp xếp theo họ rồi đến tên
              : { [sortBy]: sortOrder }),
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        models.staffSchedule.count({
          where,
        }),

        this.getActiveStaffs(),
      ]);

    const q: Record<string, string> = {};

    if (search) q.search = search;
    if (sortBy !== "workDate") q.sortBy = sortBy;
    if (sortOrder !== "desc")
      q.sortOrder = sortOrder;
    if (filterStatus)
      q.filterStatus = filterStatus;
    if (perPage !== 10)
      q.perPage = String(perPage);

    const buildQueryString = () =>
      Object.keys(q).length
        ? "&" +
          new URLSearchParams(q).toString()
        : "";

    const buildSortUrl = (col: string) => {
      const next =
        sortBy === col &&
        sortOrder === "asc"
          ? "desc"
          : "asc";

      return `/admin/staff-schedules?${new URLSearchParams(
        {
          ...q,
          sortBy: col,
          sortOrder: next,
          page: "1",
        }
      ).toString()}`;
    };

    this.render(
      "admin/staffSchedule.view/index",
      {
        user: this.req.user,
        schedules,
        staffs,
        total,
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        filterStatus,
        buildQueryString,
        buildSortUrl,
      }
    );
  }

  async show() {
    const schedule = await this.getSchedule(
      this.req.params.id
    );

    if (!schedule) {
      throw new NotFoundError(
        "Không tìm thấy lịch làm việc"
      );
    }

    this.render(
      "admin/staffSchedule.view/show",
      {
        user: this.req.user,
        schedule,
      }
    );
  }

  async new() {
    const staffs =
      await this.getActiveStaffs();

    console.log(`[SERVER] Lấy danh sách nhân viên cho trang NEW: tìm thấy ${staffs.length} người`);

    this.render(
      "admin/staffSchedule.view/new",
      {
        user: this.req.user,
        staffs,
      }
    );
  }

  /**
   * API trả về danh sách nhân viên dưới dạng JSON
   */
  async getStaffs() {
    try {
      const staffs = await this.getActiveStaffs();
      console.log(`[SERVER] API getStaffs: Found ${staffs.length} staffs`);
      return this.res.json({ success: true, staffs, total: staffs.length });
    } catch (error: any) {
      return this.res.status(500).json({ success: false, message: error.message });
    }
  }

  async create() {
    const data = await this.params(
      CreateStaffScheduleValidator
    ).permit(
      "staffId",
      "workDate",
      "startTime",
      "endTime",
      "shiftType",
      "status",
      "note",
      "serviceId"
    );

    // Normalize time format to HH:mm (e.g., 9:00 -> 09:00)
    const startTime = data.startTime.padStart(5, '0');
    const endTime = data.endTime.padStart(5, '0');

    const workDate = parseDateToUTCMidnight(data.workDate); // Sử dụng helper để tạo ngày UTC

    await this.validateSchedule({ ...data, startTime, endTime, workDate });

    const schedule =
      await models.$transaction(
        async (tx) => {
          return tx.staffSchedule.create({
            data: {
              ...data,
              startTime,
              endTime,
              workDate,
            },
          });
        }
      );

    this.flash(
      FlashType.Success,
      {
        msg:
          "Đã tạo lịch làm việc nhân viên thành công",
      }
    );

    this.redirect(
      `/admin/staff-schedules/${schedule.id}`
    );
  }

  async edit() {
    const schedule =
      await this.getSchedule(
        this.req.params.id
      );

    if (!schedule) {
      throw new NotFoundError(
        "Không tìm thấy lịch làm việc"
      );
    }

    const staffs =
      await this.getActiveStaffs();

    this.render(
      "admin/staffSchedule.view/edit",
      {
        user: this.req.user,
        schedule,
        staffs,
      }
    );
  }

  async update() {
    const id = this.req.params.id;

    const schedule =
      await this.getSchedule(id);

    if (!schedule) {
      throw new NotFoundError(
        "Schedule not found"
      );
    }

    const fields = [
      "staffId",
      "workDate",
      "startTime",
      "endTime",
      "shiftType",
      "status",
      "note",
      "serviceId",
    ];

    const fieldsToPermit =
      fields.filter((field) =>
        Object.prototype.hasOwnProperty.call(
          this.req.body,
          field
        )
      );

    const data = await this.params(
      UpdateStaffScheduleValidator
    ).permit(
      ...(fieldsToPermit as any)
    );

    // Normalize time format to HH:mm
    const startTime = data.startTime ? data.startTime.padStart(5, '0') : undefined;
    const endTime = data.endTime ? data.endTime.padStart(5, '0') : undefined;

    await this.validateSchedule({ ...data, ...(startTime && { startTime }), ...(endTime && { endTime }) }, id);

    const updateData = {
      ...data,
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(data.workDate && { // Sử dụng helper để tạo ngày UTC
        workDate: parseDateToUTCMidnight(data.workDate),
      }),
    };

    await models.staffSchedule.update({
      where: { id },
      data: updateData,
    });

    this.flash(
      FlashType.Success,
      {
        msg:
          "Đã cập nhật lịch làm việc thành công",
      }
    );

    this.redirect(
      `/admin/staff-schedules/${id}`
    );
  }

  async destroy() {
    const id = this.req.params.id;

    await models.staffSchedule.update({
      where: { id },
      data: {
        deleted: true,
      },
    });

    this.flash(
      FlashType.Success,
      {
        msg:
          "Đã xóa lịch làm việc thành công",
      }
    );

    this.redirect(
      "/admin/staff-schedules"
    );
  }

  private async validateSchedule(
    data: any,
    excludeId?: string
  ) {
    // 1. Validate staff exists and is active
    const staff = await models.user.findFirst({
      where: {
        id: data.staffId,
        ...this.staffFilter(),
      },
    });

    if (!staff) {
      throw new Error(
        "Nhân viên không tồn tại hoặc đã bị vô hiệu hóa"
      );
    }

    // 2. Validate status is allowed
    if (!VALID_STATUSES.includes(data.status)) {
      throw new Error(
        `Trạng thái không hợp lệ. Các giá trị cho phép: ${VALID_STATUSES.join(", ")}`
      );
    }

    // 3. Validate shift type is allowed
    if (data.shiftType && !VALID_SHIFT_TYPES.includes(data.shiftType)) {
      throw new Error(
        `Loại ca làm không hợp lệ. Các giá trị cho phép: ${VALID_SHIFT_TYPES.join(", ")}`
      );
    }

    // 4. Validate work date is not in the past
    const workDate = parseDateToUTCMidnight(data.workDate); // Đảm bảo workDate là UTC
    const today = new Date(); // Ngày hiện tại theo giờ địa phương của server
    // Chuyển đổi ngày hiện tại sang UTC nửa đêm để so sánh nhất quán
    const todayUTCMidnight = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    
    if (workDate < todayUTCMidnight) {
      throw new Error(
        "Ngày làm việc không được ở quá khứ"
      );
    }

    // 5. Validate start time < end time
    if (data.startTime >= data.endTime) {
      throw new Error(
        "Giờ kết thúc phải sau giờ bắt đầu"
      );
    }

    // 6. Validate working hours (08:00 - 22:00)
    const startMins = timeToMinutes(data.startTime);
    const endMins = timeToMinutes(data.endTime);
    const spaStartMins = timeToMinutes(SPA_CONFIG.WORKING_HOURS_START);
    const spaEndMins = timeToMinutes(SPA_CONFIG.WORKING_HOURS_END);

    if (startMins < spaStartMins || endMins > spaEndMins) {
      throw new Error(
        `Giờ làm việc cho phép: ${SPA_CONFIG.WORKING_HOURS_START} - ${SPA_CONFIG.WORKING_HOURS_END}`
      );
    }

    // 7. Validate minimum shift duration (30 minutes)
    const { minutes: durationMins } = calculateDuration(data.startTime, data.endTime);
    
    if (durationMins < SPA_CONFIG.MIN_SHIFT_DURATION_MINUTES) {
      throw new Error(
        `Thời lượng ca làm tối thiểu là ${SPA_CONFIG.MIN_SHIFT_DURATION_MINUTES} phút`
      );
    }

    // 8. Validate maximum shift duration (12 hours)
    if (durationMins > SPA_CONFIG.MAX_SHIFT_DURATION_HOURS * 60) {
      throw new Error(
        `Thời lượng ca làm không được vượt quá ${SPA_CONFIG.MAX_SHIFT_DURATION_HOURS} giờ`
      );
    }

    // 9. Validate no overlap with existing schedules
    const overlap = await models.staffSchedule.findFirst({
      where: {
        deleted: false,
        staffId: data.staffId,
        workDate: workDate,
        ...(excludeId && {
          id: {
            not: excludeId,
          },
        }),
        AND: [
          {
            startTime: {
              lt: data.endTime,
            },
          },
          {
            endTime: {
              gt: data.startTime,
            },
          },
        ],
      },
    });

    if (overlap) {
      throw new Error(
        `Nhân viên đã có lịch làm việc khác trong khoảng ${overlap.startTime} đến ${overlap.endTime}`
      );
    }
  }

  private async getSchedule(
    id: string
  ) {
    return models.staffSchedule.findFirst(
      {
        where: {
          id,
          deleted: false,
        },
        include: {
          staff: true,
          Service: true,
          Appointment: true,
        },
      }
    );
  }

  private staffFilter(): Prisma.UserWhereInput {
    return {
      deleted: false,
      // Bỏ qua status: ACTIVE nếu bạn muốn liệt kê cả nhân viên mới tạo chưa kích hoạt
      roles: {
        some: {
          role: {
            code: { in: ["STAFF", "staff"] }, // Case-insensitive protection
          },
        },
      },
    };
  }

  private async getActiveStaffs() {
    return models.user.findMany({
      where: this.staffFilter(),
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
      },
      orderBy: [
        {
          firstName: "asc",
        },
        {
          lastName: "asc",
        },
      ],
    });
  }
}