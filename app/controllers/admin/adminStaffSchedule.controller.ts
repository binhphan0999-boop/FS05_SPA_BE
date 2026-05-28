// import { FlashType } from "@configs/enum";
// import { Prisma } from "@db";
// import models from "@models";

// import {
//   CreateStaffScheduleValidator,
//   UpdateStaffScheduleValidator,
// } from "@validators/admin.validator";

// import { NotFoundError } from "ts-rails";

// import { AdminController } from "./admin.controller";

// export class AdminStaffScheduleController extends AdminController {
//   async index() {
//     const search =
//       String(this.req.query.search || "")
//         .trim();

//     const sortBy =
//       String(
//         this.req.query.sortBy ||
//         "workDate"
//       );

//     const sortOrder =
//       String(
//         this.req.query.sortOrder ||
//         "desc"
//       ) as "asc" | "desc";

//     const filterStatus =
//       String(
//         this.req.query
//           .filterStatus || ""
//       );

//     const page =
//       Math.max(
//         1,
//         parseInt(
//           String(
//             this.req.query.page ||
//             "1"
//           ),
//           10
//         )
//       );

//     const perPage =
//       Math.min(
//         50,
//         Math.max(
//           10,
//           parseInt(
//             String(
//               this.req.query
//                 .perPage || "10"
//             ),
//             10
//           )
//         )
//       );

//     const where:
//       Prisma.StaffScheduleWhereInput =
//       {
//         deleted: false,
//       };

//     if (search) {
//       where.staff = {
//         OR: [
//           {
//             firstName: {
//               contains:
//                 search,
//               mode:
//                 "insensitive",
//             },
//           },
//           {
//             lastName: {
//               contains:
//                 search,
//               mode:
//                 "insensitive",
//             },
//           },
//           {
//             email: {
//               contains:
//                 search,
//               mode:
//                 "insensitive",
//             },
//           },
//         ],
//       };
//     }

//     if (filterStatus) {
//       where.status =
//         filterStatus;
//     }

//     const [
//       schedules,
//       total,
//       staffs,
//     ] = await Promise.all([
//       models.staffSchedule.findMany(
//         {
//           where,

//           include: {
//             staff: true,
//           },

//           orderBy: {
//             [sortBy]:
//               sortOrder,
//           },

//           skip:
//             (page - 1) *
//             perPage,

//           take: perPage,
//         }
//       ),

//       models.staffSchedule.count(
//         {
//           where,
//         }
//       ),

//       this.getActiveStaffs(),
//     ]);

//     const q:
//       Record<
//         string,
//         string
//       > = {};

//     if (search)
//       q.search = search;

//     if (
//       sortBy !==
//       "workDate"
//     )
//       q.sortBy =
//         sortBy;

//     if (
//       sortOrder !==
//       "desc"
//     )
//       q.sortOrder =
//         sortOrder;

//     if (filterStatus)
//       q.filterStatus =
//         filterStatus;

//     if (
//       perPage !== 10
//     )
//       q.perPage =
//         String(perPage);

//     const buildQueryString =
//       () =>
//         Object.keys(q)
//           .length
//           ? "&" +
//             new URLSearchParams(
//               q
//             ).toString()
//           : "";

//     const buildSortUrl =
//       (
//         col: string
//       ) => {
//         const next =
//           sortBy ===
//             col &&
//           sortOrder ===
//             "asc"
//             ? "desc"
//             : "asc";

//         return `/admin/staff-schedules?${new URLSearchParams(
//           {
//             ...q,
//             sortBy:
//               col,
//             sortOrder:
//               next,
//             page: "1",
//           }
//         ).toString()}`;
//       };

//     this.render(
//       "admin/staffSchedule.view/index",
//       {
//         schedules,
//         staffs,
//         total,
//         page,
//         perPage,
//         search,
//         sortBy,
//         sortOrder,
//         filterStatus,
//         buildQueryString,
//         buildSortUrl,
//       }
//     );
//   }

//   async show() {
//     const schedule =
//       await this.getSchedule(
//         this.req.params.id
//       );

//     if (!schedule) {
//       throw new NotFoundError(
//         "Schedule not found"
//       );
//     }

//     this.render(
//       "admin/staffSchedule.view/show",
//       {
//         user:
//           this.req.user,
//         schedule,
//       }
//     );
//   }

//   async new() {
//     const staffs = await this.getActiveStaffs();

//     this.render(
//       "admin/staffSchedule.view/new",
//       {
//         user:
//           this.req.user,
//         staffs,
//       }
//     );
//   }

//   async create() {
//     const data =
//       await this.params(
//         CreateStaffScheduleValidator
//       ).permit(
//         "staffId",
//         "workDate",
//         "startTime",
//         "endTime",
//         "shiftType",
//         "status",
//         "note"
//       );

//     const staff =
//       await models.user.findFirst(
//         {
//           where: {
//             id: data.staffId,
//             ...this.staffFilter(),
//           },
//         }
//       );

//     if (!staff) {
//       throw new Error(
//         "Staff not found"
//       );
//     }

//     // Chuyển đổi workDate thành đối tượng Date trước khi lưu
//     const createData = {
//       ...data,
//       workDate: new Date(data.workDate).toISOString(),
//     };

//     const schedule = await models.staffSchedule.create({
//       data: createData,
//     });

//     this.flash(
//       FlashType.Success,
//       {
//         msg:
//           "Created staff schedule successfully",
//       }
//     );

//     this.redirect(
//       `/admin/staff-schedules/${schedule.id}`
//     );
//   }

//   async edit() {
//     const schedule =
//       await this.getSchedule(
//         this.req.params.id
//       );

//     if (!schedule) {
//       throw new NotFoundError(
//         "Schedule not found"
//       );
//     }

//     const staffs = await this.getActiveStaffs();

//     this.render(
//       "admin/staffSchedule.view/edit",
//       {
//         user:
//           this.req.user,
//         schedule,
//         staffs,
//       }
//     );
//   }

//   async update() {
//     const id =
//       this.req.params.id;

//     const allFields =
//       [
//         "staffId",
//         "workDate",
//         "startTime",
//         "endTime",
//         "shiftType",
//         "status",
//         "note",
//       ];

//     const fieldsToPermit =
//       allFields.filter(
//         (
//           field
//         ) =>
//           Object.prototype.hasOwnProperty.call(
//             this.req.body,
//             field
//           )
//       );

//     const data =
//       await this.params(
//         UpdateStaffScheduleValidator
//       ).permit(
//         ...(fieldsToPermit as any)
//       );

//     const updateData: any = { ...data };

//     if (updateData.workDate) {
//       updateData.workDate = new Date(updateData.workDate).toISOString();
//     }

//     const schedule =
//       await models.staffSchedule.update({
//         where: {
//           id,
//         },
//         data: updateData,
//       });

//     this.flash(
//       FlashType.Success,
//       {
//         msg:
//           "Staff schedule updated successfully",
//       }
//     );

//     this.redirect(
//       `/admin/staff-schedules/${schedule.id}`
//     );
//   }

//   async destroy() {
//     const id =
//       this.req.params.id;

//     await models.staffSchedule.delete(
//       {
//         where: {
//           id,
//         },
//       }
//     );

//     this.flash(
//       FlashType.Success,
//       {
//         msg:
//           "Deleted successfully",
//       }
//     );

//     this.redirect(
//       "/admin/staff-schedules"
//     );
//   }

//   private async getSchedule(
//     id: string
//   ) {
//     return await models.staffSchedule.findFirst(
//       {
//         where: {
//           id,
//           deleted:
//             false,
//         },

//         include: {
//           staff: true,
//         },
//       }
//     );
//   }

//   private staffFilter() {
//     return {
//       deleted: false,
//       status: "ACTIVE",
//       roles: {
//         some: {
//           role: { code: "STAFF" },
//         },
//       },
//     };
//   }

//   private async getActiveStaffs() {
//     return await models.user.findMany({
//       where: this.staffFilter(),
//       select: {
//         id: true,
//         firstName: true,
//         middleName: true,
//         lastName: true,
//       },
//       orderBy: [
//         {
//           firstName: "asc",
//         },
//         {
//           lastName: "asc",
//         },
//       ],
//     });
//   }
// }


import { FlashType } from "@configs/enum";
import { Prisma } from "@db";
import models from "@models";
import {
  CreateStaffScheduleValidator,
  UpdateStaffScheduleValidator,
} from "@validators/admin.validator";
import { NotFoundError } from "ts-rails";
import { AdminController } from "./admin.controller";

export class AdminStaffScheduleController extends AdminController {
  private readonly SORTABLE_FIELDS = [
    "workDate",
    "startTime",
    "endTime",
    "shiftType",
    "status",
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
      where.OR = [
        {
          staff: {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          staff: {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          staff: {
            email: {
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
        },
      ];
    }

    if (filterStatus) {
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
            [sortBy]: sortOrder,
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
        "Schedule not found"
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

    this.render(
      "admin/staffSchedule.view/new",
      {
        user: this.req.user,
        staffs,
      }
    );
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

    await this.validateSchedule(data);

    const schedule =
      await models.$transaction(
        async (tx) => {
          return tx.staffSchedule.create({
            data: {
              ...data,
              workDate: new Date(
                data.workDate
              ),
            },
          });
        }
      );

    this.flash(
      FlashType.Success,
      {
        msg:
          "Staff schedule created successfully",
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
        "Schedule not found"
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

    await this.validateSchedule(
      data,
      id
    );

    const updateData = {
      ...data,
      ...(data.workDate && {
        workDate: new Date(
          data.workDate
        ),
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
          "Staff schedule updated successfully",
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
          "Staff schedule deleted successfully",
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
    const staff =
      await models.user.findFirst({
        where: {
          id: data.staffId,
          ...this.staffFilter(),
        },
      });

    if (!staff) {
      throw new Error(
        "Staff not found or inactive"
      );
    }

    if (
      data.startTime >=
      data.endTime
    ) {
      throw new Error(
        "End time must be greater than start time"
      );
    }

    const overlap =
      await models.staffSchedule.findFirst(
        {
          where: {
            deleted: false,
            staffId:
              data.staffId,
            workDate: new Date(
              data.workDate
            ),
            ...(excludeId && {
              id: {
                not: excludeId,
              },
            }),
            AND: [
              {
                startTime: {
                  lt:
                    data.endTime,
                },
              },
              {
                endTime: {
                  gt:
                    data.startTime,
                },
              },
            ],
          },
        }
      );

    if (overlap) {
      throw new Error(
        "Staff already has another schedule in this time range"
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

  private staffFilter() {
    return {
      deleted: false,
      status: "ACTIVE",
      roles: {
        some: {
          role: {
            code: "STAFF",
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