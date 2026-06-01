import { FlashType } from "@configs/enum";
import { Prisma } from "@db";
import models from "@models";
import {
  CreateAppointmentValidator,
  UpdateAppointmentValidator,
} from "@validators/admin.validator";
import { NotFoundError } from "ts-rails";
import { AdminController } from "./admin.controller";

/**
 * Constants for Appointment Management
 */
const APPOINTMENT_STATUS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"];
const SORT_FIELDS = ["createdAt", "appointmentDate", "appointmentCode", "customerName", "status"];
const SPA_START_TIME = "08:00";
const SPA_END_TIME = "22:00";
const MIN_DURATION_MINS = 15;
const MAX_DURATION_MINS = 480; // 8 hours

export class AdminAppointmentController extends AdminController {
  async index() {
    const search = String(this.req.query.search || "").trim();

    const sortBy = SORT_FIELDS.includes(
      String(this.req.query.sortBy),
    )
      ? String(this.req.query.sortBy)
      : "createdAt";

    const sortOrder =
      String(this.req.query.sortOrder) === "asc"
        ? "asc"
        : "desc";

    const filterStatus = String(
      this.req.query.filterStatus || "",
    );

    const page = Math.max(
      1,
      parseInt(String(this.req.query.page || "1"), 10),
    );

    const perPage = Math.min(
      50,
      Math.max(
        10,
        parseInt(
          String(this.req.query.perPage || "10"),
          10,
        ),
      ),
    );

    const where: Prisma.AppointmentWhereInput = {
      deleted: false,
    };

    if (search) {
      where.OR = [
        {
          appointmentCode: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customerName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customerPhone: {
            contains: search,
          },
        },
      ];
    }

    if (
      filterStatus &&
      APPOINTMENT_STATUS.includes(filterStatus)
    ) {
      where.status = filterStatus;
    }

    const [appointments, total] =
      await models.$transaction([
        models.appointment.findMany({
          where,
          include: {
            staff: true,
            service: true,
            staffSchedule: true,
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        models.appointment.count({
          where,
        }),
      ]);

    const q: Record<string, string> = {};

    if (search) q.search = search;
    if (sortBy !== "createdAt")
      q.sortBy = sortBy;
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

      return `/admin/appointments?${new URLSearchParams({
        ...q,
        sortBy: col,
        sortOrder: next,
        page: "1",
      }).toString()}`;
    };

    this.render(
      "admin/appointment.view/index",
      {
        appointments,
        total,
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        filterStatus,
        buildQueryString,
        buildSortUrl,
      },
    );
  }

  async show() {
    console.log('--- [SERVER] Hitting SHOW action with ID:', this.req.params.id);
    
    const appointment =
      await this.getAppointment(
        this.req.params.id,
      );

    if (!appointment) {
      throw new NotFoundError(
        "Appointment not found",
      );
    }

    this.render(
      "admin/appointment.view/show",
      {
        user: this.req.user,
        appointment: appointment as any, // Cast for template engine compatibility
      },
    );
  }

  async new() {
    const [staffs, services] =
      await Promise.all([
        this.getStaffs(),
        this.getServices(),
      ]);

    this.render(
      "admin/appointment.view/new",
      {
        staffs,
        services,
      },
    );
  }

  /**
   * API Endpoint: Suggests available staff and identifies a suggested ID.
   * Logic: Staff must have ACTIVE schedule + No conflicts.
   */
  async getAvailableStaff() {
    try {
      const appointmentDateStr = String(this.req.query.appointmentDate || "");
      // Đảm bảo định dạng HH:mm (ví dụ 9:00 -> 09:00) để so sánh chuỗi chính xác
      const startTime = String(this.req.query.startTime || "").padStart(5, '0');
      const endTime = String(this.req.query.endTime || "").padStart(5, '0');
      const excludeId = String(this.req.query.excludeId || "");

      console.log('\n********** [SERVER] GET AVAILABLE STAFF REQUEST **********');
      console.log('Params:', { appointmentDateStr, startTime, endTime });

      if (!appointmentDateStr || !startTime || !endTime) {
        console.log('Result: Missing params');
        return this.res.status(400).json({ staffs: [], suggestedStaffId: null });
      }

      // Chuyển đổi chuỗi YYYY-MM-DD sang đối tượng Date ở múi giờ địa phương (00:00:00)
      // Cách này an toàn hơn new Date(str) vốn mặc định về UTC cho định dạng ISO
      const [year, month, day] = appointmentDateStr.split("-").map(Number);
      const appointmentDate = new Date(year, month - 1, day);
      appointmentDate.setHours(0, 0, 0, 0);

      const availableSchedules = await this.fetchAvailableStaff(appointmentDate, startTime, endTime, excludeId);
      
      console.log('Result: Found', availableSchedules.length, 'staffs');
      console.log('*********************************************************\n');

      return this.res.json({
        availableSchedules,
        suggestedScheduleId: availableSchedules.length > 0 ? availableSchedules[0].scheduleId : null,
      });
    } catch (err) {
      console.error('!!! [SERVER] ERROR in getAvailableStaff:', err);
      return this.res.status(500).json({ 
        availableSchedules: [], 
        suggestedScheduleId: null, 
        error: (err as Error).message 
      });
    }
  }

  private async fetchAvailableStaff(
    appointmentDate: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ) {
    // Tạo khoảng thời gian trong ngày để tránh lỗi lệch múi giờ khi so sánh khớp tuyệt đối
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Find ACTIVE schedules covering the time range
    const schedules = await models.staffSchedule.findMany({
      where: {
        deleted: false,
        status: "ACTIVE",
        workDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        startTime: { lte: startTime },
        endTime: { gte: endTime },
      },
      include: {
        staff: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    const availableSchedules = [];

    // 2. Filter out schedules with conflicting appointments
    for (const schedule of schedules) {
      const conflict = await models.appointment.findFirst({
        where: {
          deleted: false,
          staffId: schedule.staffId,
          appointmentDate: appointmentDate,
          id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      });

      if (!conflict) {
        availableSchedules.push({
          staff: schedule.staff,
          scheduleId: schedule.id
        });
      }
    }

    return availableSchedules;
  }

  async byDate() {
    const dateStr = String(this.req.query.date || "").trim();
    if (!dateStr) return this.res.json({ schedules: [] });

    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      date.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const schedules = await models.staffSchedule.findMany({
        where: {
          deleted: false,
          status: "ACTIVE",
          workDate: {
            gte: date,
            lte: endOfDay
          },
        },
        include: {
          staff: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { staff: { firstName: "asc" } },
      });

      return this.res.json({ schedules });
    } catch (err) {
      return this.res.status(500).json({ schedules: [] });
    }
  }

  async create() {
    try {
      const data =
        await this.params(
          CreateAppointmentValidator,
        ).permit(
          "appointmentCode",
          "customerName",
          "customerPhone",
          "room",
          "appointmentDate",
          "startTime",
          "endTime",
          "staffId",
          "staffScheduleId",
          "serviceId",
          "status",
          "note",
          "cancellationReason",
          "createdById",
        );

      // Normalize time format to HH:mm (e.g., 9:00 -> 09:00)
      const startTime = String(data.startTime || "").padStart(5, '0');
      const endTime = String(data.endTime || "").padStart(5, '0');
      
      const appointmentDate = this.parseLocalDate(String(data.appointmentDate));

      const appointmentCode = data.appointmentCode?.trim() || 
        (await this.generateAppointmentCode());

      await models.$transaction(
        async (tx) => {
          await this.validateAppointment(
            tx,
            {
              ...data,
              startTime,
              endTime,
              appointmentDate,
            },
          );

          const appointment =
            await tx.appointment.create({
              data: {
                ...data,
                startTime,
                endTime,
                appointmentCode,
                appointmentDate,
              },
            });

          this.flash(
            FlashType.Success,
            {
              msg: `Created appointment ${appointment.appointmentCode}`,
            },
          );
        },
      );

      this.redirect(
        "/admin/appointments",
      );
    } catch (error: any) {
      this.handleValidationError(error, "/admin/appointments/new");
    }
  }

  async edit() {
    const appointment =
      await this.getAppointment(
        this.req.params.id,
      );

    if (!appointment) {
      throw new NotFoundError(
        "Appointment not found",
      );
    }

    const [staffs, services] =
      await Promise.all([
        this.getStaffs(),
        this.getServices(),
      ]);

    this.render(
      "admin/appointment.view/edit",
      {
        appointment,
        staffs,
        services,
      },
    );
  }

  async update() {
    const id = this.req.params.id;
    try {
      const current =
        await this.getAppointment(id);

      if (!current) {
        throw new NotFoundError(
          "Appointment not found",
        );
      }

      const permittedFields = [
        "appointmentCode",
        "customerName",
        "customerPhone",
        "room",
        "appointmentDate",
        "startTime",
        "endTime",
        "staffId",
        "staffScheduleId",
        "serviceId",
        "status",
        "note",
        "cancellationReason",
        "createdById",
      ].filter((field) =>
        Object.prototype.hasOwnProperty.call(
          this.req.body,
          field,
        ),
      );

      const data =
        await this.params(
          UpdateAppointmentValidator,
        ).permit(
          ...(permittedFields as any),
        );

      // Normalize time format
      const startTime = data.startTime ? String(data.startTime).padStart(5, '0') : undefined;
      const endTime = data.endTime ? String(data.endTime).padStart(5, '0') : undefined;

      const appointmentDate =
        data.appointmentDate
          ? this.parseLocalDate(String(data.appointmentDate))
          : current.appointmentDate;

      await models.$transaction(
        async (tx) => {
          await this.validateAppointment(
            tx,
            {
              ...current,
              ...data,
              ...(startTime && { startTime }),
              ...(endTime && { endTime }),
              appointmentDate,
            },
            id,
          );

          await tx.appointment.update({
            where: { id },
            data: {
              ...data,
              ...(startTime && { startTime }),
              ...(endTime && { endTime }),
              appointmentDate,
            },
          });
        },
      );

      this.flash(
        FlashType.Success,
        {
          msg: "Appointment updated successfully",
        },
      );

      this.redirect(
        `/admin/appointments/${id}`,
      );
    } catch (error: any) {
      this.handleValidationError(error, `/admin/appointments/${id}/edit`);
    }
  }

  async destroy() {
    const id = this.req.params.id;

    await models.appointment.update({
      where: { id },
      data: {
        deleted: true,
      },
    });

    this.flash(
      FlashType.Success,
      {
        msg:
          "Appointment deleted successfully",
      },
    );

    this.redirect(
      "/admin/appointments",
    );
  }

  private handleValidationError(error: any, redirectPath: string) {
    console.error("--- [SERVER ERROR] ---", error);

    let errorMsg = error.message;

    try {
      // Nếu là lỗi validation từ class-validator (thường được bọc trong UnprocessableEntityError)
      if (error.name === "UnprocessableEntityError" && error.errors && typeof error.errors === 'object') {
        // error.errors là một object có dạng: { field: ["message1", "message2"] }
        const detailedErrors = Object.entries(error.errors)
          .map(([field, msgs]) => `${field}: ${(msgs as any).join(", ")}`)
          .join(" | ");
        errorMsg = `Dữ liệu không hợp lệ: ${detailedErrors}`;
      }
    } catch (e) {
      console.error("--- [CRITICAL] Failed to format detailed errors ---", e);
    }

    this.flash(FlashType.Success, { msg: `LỖI: ${errorMsg}` });
    this.redirect(redirectPath);
  }

  private parseLocalDate(dateStr: string): Date {
    const parts = dateStr.split("-").map(Number);
    if (parts.length !== 3) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }
    // Tạo ngày tại Midnight UTC để đảm bảo tính nhất quán khi lưu vào DB
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  }

  private parseTimeToMinutes(time: string): number | null {
    if (!time || typeof time !== "string") return null;
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const [, hoursStr, minutesStr] = match;
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  private validateTimeFormat(time: string): boolean {
    if (!time || typeof time !== "string") return false;
    const match = time.match(/^(\d{2}):(\d{2})$/);
    if (!match) return false;
    const [, hoursStr, minutesStr] = match;
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return false;
    // Bỏ ràng buộc chia hết cho 5 để cho phép các thời gian lẻ như 10:21
    // if (minutes % 5 !== 0) return false; 
    return true;
  }

  private validateTimeRange(
    startTime: string,
    endTime: string,
  ): { valid: boolean; error?: string } {
    if (!startTime || !endTime) {
      return { valid: false, error: "Start time and end time are required." };
    }

    if (!this.validateTimeFormat(startTime)) {
      return { valid: false, error: "Start time format must be HH:mm (e.g., 10:21)." };
    }

    if (!this.validateTimeFormat(endTime)) {
      return { valid: false, error: "End time format must be HH:mm (e.g., 12:21)." };
    }

    const spaStartMins = this.parseTimeToMinutes(SPA_START_TIME)!;
    const spaEndMins = this.parseTimeToMinutes(SPA_END_TIME)!;
    const startMins = this.parseTimeToMinutes(startTime)!;
    const endMins = this.parseTimeToMinutes(endTime)!;

    if (startMins < spaStartMins) {
      return { valid: false, error: `Start time cannot be before ${SPA_START_TIME}.` };
    }

    if (startMins >= spaEndMins) {
      return { valid: false, error: `Start time must be before ${SPA_END_TIME}.` };
    }

    if (endMins <= spaStartMins) {
      return { valid: false, error: `End time must be after ${SPA_START_TIME}.` };
    }

    if (endMins > spaEndMins) {
      return { valid: false, error: `End time cannot be after ${SPA_END_TIME}.` };
    }

    if (endMins <= startMins) {
      return { valid: false, error: "End time must be later than start time." };
    }

    if (endMins - startMins < MIN_DURATION_MINS) {
      return {
        valid: false,
        error: `Appointment duration must be at least ${MIN_DURATION_MINS} minutes.`,
      };
    }

    if (endMins - startMins > MAX_DURATION_MINS) {
      return { valid: false, error: `Appointment cannot exceed ${MAX_DURATION_MINS / 60} hours.` };
    }

    return { valid: true };
  }

  private validateAppointmentDate(
    appointmentDate: Date,
  ): { valid: boolean; error?: string } {
    if (!appointmentDate || !(appointmentDate instanceof Date)) {
      return { valid: false, error: "Invalid appointment date." };
    }

    if (isNaN(appointmentDate.getTime())) {
      return { valid: false, error: "Invalid appointment date." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return { valid: false, error: "Appointment cannot be scheduled in the past." };
    }

    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (appointmentDate > maxDate) {
      return { valid: false, error: "Appointment cannot be more than 365 days in advance." };
    }

    return { valid: true };
  }

  private validateAppointmentCode(code: string): { valid: boolean; error?: string } {
    if (!code) return { valid: true };

    const trimmed = code.trim();
    if (trimmed.length < 3 || trimmed.length > 30) {
      return { valid: false, error: "Appointment code must be 3-30 characters." };
    }

    if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
      return {
        valid: false,
        error: "Appointment code can only contain letters, numbers, hyphens, and underscores.",
      };
    }

    return { valid: true };
  }

  private validateCustomerName(name: string): { valid: boolean; error?: string; sanitized?: string } {
    if (!name || typeof name !== "string") {
      return { valid: false, error: "Customer name is required." };
    }

    const trimmed = String(name).trim();
    if (trimmed.length < 2) return { valid: false, error: "Customer name must be at least 2 characters." };
    if (trimmed.length > 100) return { valid: false, error: "Customer name cannot exceed 100 characters." };
    if (/^\s*$/.test(trimmed)) return { valid: false, error: "Customer name cannot be only whitespace." };

    return { valid: true, sanitized: trimmed };
  }

  private validateCustomerPhone(phone: string): { valid: boolean; error?: string; sanitized?: string } {
    if (!phone || typeof phone !== "string") {
      return { valid: false, error: "Customer phone is required." };
    }

    const trimmed = String(phone).trim();
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;

    if (!phoneRegex.test(trimmed)) {
      return {
        valid: false,
        error: "Invalid phone format. Use Vietnamese format: 0901234567 or +84901234567.",
      };
    }

    return { valid: true, sanitized: trimmed };
  }

  private validateRoom(room: string): { valid: boolean; error?: string; sanitized?: string } {
    if (!room || typeof room !== "string") {
      return { valid: false, error: "Room is required." };
    }

    const trimmed = String(room).trim();
    if (trimmed.length < 1 || trimmed.length > 30) return { valid: false, error: "Room must be 1-30 characters." };
    if (/^\s*$/.test(trimmed)) return { valid: false, error: "Room cannot be only whitespace." };

    return { valid: true, sanitized: trimmed };
  }


  private async validateAppointment(
    tx: Prisma.TransactionClient,
    data: any,
    excludeId?: string,
  ) {
    // 1. Validate appointment date
    const dateValidation = this.validateAppointmentDate(data.appointmentDate);
    if (!dateValidation.valid) throw new Error(dateValidation.error);

    // 2. Validate time format and range
    const timeValidation = this.validateTimeRange(data.startTime, data.endTime);
    if (!timeValidation.valid) throw new Error(timeValidation.error);

    // 3. Validate same-day current time (if booking for today)
    // Lấy ngày hiện tại tại Việt Nam dưới dạng chuỗi YYYY-MM-DD
    const vnTodayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
    const vnAppDateStr = data.appointmentDate instanceof Date 
      ? data.appointmentDate.toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' })
      : String(data.appointmentDate);

    if (vnAppDateStr === vnTodayStr) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const roundedStartMins = Math.ceil(currentMinutes / 5) * 5;
      const startMins = this.parseTimeToMinutes(data.startTime)!;

      if (startMins < roundedStartMins) {
        const earliest = `${String(Math.floor(roundedStartMins / 60)).padStart(2, "0")}:${String(roundedStartMins % 60).padStart(2, "0")}`;
        throw new Error(`Cannot book start time in the past. Earliest: ${earliest}`);
      }
    }

    // 4. Validate appointment code
    if (data.appointmentCode) {
      const codeValidation = this.validateAppointmentCode(String(data.appointmentCode));
      if (!codeValidation.valid) {
        throw new Error(codeValidation.error);
      }

      const existingCode = await tx.appointment.findFirst({
        where: {
          appointmentCode: data.appointmentCode.trim(),
          deleted: false,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });

      if (existingCode) {
        throw new Error("Appointment code already exists.");
      }
    }

    // 5. Validate customer name
    const nameValidation = this.validateCustomerName(data.customerName);
    if (!nameValidation.valid) throw new Error(nameValidation.error);

    // 6. Validate customer phone
    const phoneValidation = this.validateCustomerPhone(data.customerPhone);
    if (!phoneValidation.valid) throw new Error(phoneValidation.error);

    // 7. Validate room
    const roomValidation = this.validateRoom(data.room);
    if (!roomValidation.valid) throw new Error(roomValidation.error);

    // 8. Validate status
    if (data.status && !APPOINTMENT_STATUS.includes(data.status)) {
      throw new Error(`Invalid status. Allowed: ${APPOINTMENT_STATUS.join(", ")}.`);
    }

    // 9. Validate staff (if provided)
    if (data.staffId) {
      const staff = await tx.user.findFirst({
        where: { id: data.staffId, deleted: false, status: "ACTIVE" },
      });
      if (!staff) {
        throw new Error("Staff not found or inactive.");
      }
    }

    // 10. Validate service (if provided)
    if (data.serviceId) {
      const service = await tx.service.findFirst({
        where: {
          id: data.serviceId,
          isActive: true,
        },
      });

      if (!service) {
        throw new Error("Service not found or inactive.");
      }
    }

    // 11. Validate staff schedule (if provided)
    if (data.staffScheduleId) {
      const schedule = await tx.staffSchedule.findFirst({
        where: {
          id: data.staffScheduleId,
          deleted: false,
          status: "ACTIVE",
        },
      });

      if (!schedule) {
        throw new Error("Staff schedule not found or inactive.");
      }

      // So sánh ngày theo múi giờ Việt Nam một cách tuyệt đối (Tránh lỗi lệch 1 ngày)
      const toDateOnlyStr = (d: Date | string) => {
        const dateObj = d instanceof Date ? d : new Date(d);
        return dateObj.toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
      };

      const scheduleDateStr = toDateOnlyStr(schedule.workDate);
      const appointmentDateStr = toDateOnlyStr(data.appointmentDate);

      if (appointmentDateStr !== scheduleDateStr) {
        throw new Error("Appointment date must match staff schedule work date.");
      }

      const startMins = this.parseTimeToMinutes(data.startTime)!;
      const endMins = this.parseTimeToMinutes(data.endTime)!;
      const scheduleStartMins = this.parseTimeToMinutes(schedule.startTime)!;
      const scheduleEndMins = this.parseTimeToMinutes(schedule.endTime)!;

      if (startMins < scheduleStartMins || endMins > scheduleEndMins) {
        throw new Error(
          `Appointment must be within staff working hours (${schedule.startTime} - ${schedule.endTime}).`,
        );
      }
    }

    // 12. Validate staff appointment conflict
    if (data.staffId && data.appointmentDate) {
      const startMins = this.parseTimeToMinutes(data.startTime)!;
      const endMins = this.parseTimeToMinutes(data.endTime)!;

      const conflict = await tx.appointment.findFirst({
        where: {
          deleted: false,
          staffId: data.staffId,
          appointmentDate: data.appointmentDate,
          ...(excludeId && { id: { not: excludeId } }),
          AND: [
            { startTime: { lt: data.endTime } },
            { endTime: { gt: data.startTime } },
          ],
        },
      });

      if (conflict) {
        throw new Error(
          `Staff already has an appointment from ${conflict.startTime} to ${conflict.endTime} on this date.`,
        );
      }
    }
  }

  private async generateAppointmentCode() {
    const count = await models.appointment.count();
    return `APT-${String(count + 1).padStart(6, "0")}`;
  }

  private async getStaffs() {
    return models.user.findMany({
      where: { 
        deleted: false, 
        roles: {
          some: {
            role: { 
              code: { in: ["STAFF", "staff"] } 
            }
          }
        }
      },
      select: { id: true, firstName: true, lastName: true },
    });
  }

  private async getServices() {
    return models.service.findMany({
      where: { isActive: true },
    });
  }

  private async getAppointment(id: string) {
    return models.appointment.findFirst(
      {
        where: { id, deleted: false },
        include: {
          staff: true,
          service: true,
          staffSchedule: true,
          createdBy: true,
        },
      },
    );
  }
}