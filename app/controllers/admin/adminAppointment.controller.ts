// import { FlashType } from "@configs/enum";
// import { Prisma } from "@db";
// import models from "@models";
// import {
//   CreateAppointmentValidator,
//   UpdateAppointmentValidator,
// } from "@validators/admin.validator";
// import { NotFoundError } from "ts-rails";
// import { AdminController } from "./admin.controller";

// export class AdminAppointmentController extends AdminController {
//   async index() {
//     const search = String(this.req.query.search || "").trim();
//     const sortBy = String(this.req.query.sortBy || "createdAt");
//     const sortOrder = String(this.req.query.sortOrder || "desc") as
//       | "asc"
//       | "desc";
//     const filterStatus = String(this.req.query.filterStatus || "");
//     const page = Math.max(1, parseInt(String(this.req.query.page || "1"), 10));
//     const perPage = Math.min(
//       50,
//       Math.max(10, parseInt(String(this.req.query.perPage || "10"), 10)),
//     );

//     const where: Prisma.AppointmentWhereInput = {};
//     if (search) {
//       where.OR = [
//         { appointmentCode: { contains: search } },
//         { customerName: { contains: search } },
//         { customerPhone: { contains: search } },
//         // { staffName: { contains: search } },
//         // { serviceName: { contains: search } },
//       ];
//     }
//     if (filterStatus) where.status = filterStatus;

//     const [appointments, total] = await Promise.all([
//       models.appointment.findMany({
//         where,
//         orderBy: { [sortBy]: sortOrder },
//         skip: (page - 1) * perPage,
//         take: perPage,
//       }),
//       models.appointment.count({ where }),
//     ]);

//     const q: Record<string, string> = {};
//     if (search) q.search = search;
//     if (sortBy !== "createdAt") q.sortBy = sortBy;
//     if (sortOrder !== "desc") q.sortOrder = sortOrder;
//     if (filterStatus) q.filterStatus = filterStatus;
//     if (perPage !== 10) q.perPage = String(perPage);

//     const buildQueryString = () =>
//       Object.keys(q).length ? "&" + new URLSearchParams(q).toString() : "";

//     const buildSortUrl = (col: string) => {
//       const next = sortBy === col && sortOrder === "asc" ? "desc" : "asc";
//       return `/admin/appointments?${new URLSearchParams({ ...q, sortBy: col, sortOrder: next, page: "1" }).toString()}`;
//     };

//     this.render("admin/appointment.view/index", {
//       appointments,
//       total,
//       page,
//       perPage,
//       search,
//       sortBy,
//       sortOrder,
//       filterStatus,
//       buildQueryString,
//       buildSortUrl,
//     });
//   }

//   async show() {
//     const appointment = await this.getAppointment(this.req.params.id);
//     if (!appointment) throw new NotFoundError("Appointment not found");

//     this.render("admin/appointment.view/show", {
//       user: this.req.user,
//       appointment,
//     });
//   }

//   async new() {
//     const [staffs, services] = await Promise.all([
//       models.user.findMany({
//         where: { deleted: false, status: "ACTIVE", roles: { some: { role: { code: "STAFF" } } } },
//         select: { id: true, firstName: true, lastName: true },
//       }),
//       models.service.findMany({ where: { isActive: true } }),
//     ]);

//     this.render("admin/appointment.view/new", {
//       staffs,
//       services,
//     });
//   }

//   async create() {
//     const data = await this.params(CreateAppointmentValidator).permit(
//       "appointmentCode",
//       "customerName",
//       "customerPhone",
//       "room",
//       "appointmentDate",
//       "startTime",
//       "endTime",
//       "staffId",
//       "staffScheduleId",
//       "serviceId",
//       "status",
//       "note",
//       "cancellationReason",
//       "createdById"
//     );

//     const createData = {
//       ...data,
//       appointmentDate: new Date(data.appointmentDate).toISOString(),
//     };

//     const appointment = await models.appointment.create({
//       data: createData,
//     });

//     this.flash(FlashType.Success, {
//       msg: `Created appointment ${appointment.appointmentCode}`,
//     });
//     this.redirect("/admin/appointments");
//   }

//   async edit() {
//     const appointment = await this.getAppointment(this.req.params.id);
//     if (!appointment) throw new NotFoundError("Appointment not found");

//     const [staffs, services] = await Promise.all([
//       models.user.findMany({
//         where: { deleted: false, status: "ACTIVE", roles: { some: { role: { code: "STAFF" } } } },
//         select: { id: true, firstName: true, lastName: true },
//       }),
//       models.service.findMany({ where: { isActive: true } }),
//     ]);

//     this.render("admin/appointment.view/edit", {
//       appointment,
//       staffs,
//       services,
//     });
//   }

//   async update() {
//     const id = this.req.params.id;
//     const allPermittedFields = [
//       "appointmentCode",
//       "customerName",
//       "customerPhone",
//       "room",
//       "appointmentDate",
//       "startTime",
//       "endTime",
//       "staffId",
//       "staffScheduleId",
//       "serviceId",
//       "status",
//       "note",
//       "cancellationReason",
//       "createdById",
//     ];

//     const fieldsToPermit = allPermittedFields.filter(field => Object.prototype.hasOwnProperty.call(this.req.body, field));
//     const data = await this.params(UpdateAppointmentValidator).permit(...fieldsToPermit as any);

//     const updateData = { ...data };

//     if (updateData.appointmentDate) {
//       updateData.appointmentDate = new Date(updateData.appointmentDate).toISOString();
//     }

//     const appointment = await models.appointment.update({
//       where: { id },
//       data: updateData,
//     });

//     this.flash(FlashType.Success, { msg: "Appointment updated successfully" });
//     this.redirect(`/admin/appointments/${appointment.id}`);
//   }

//   async destroy() {
//     const id = this.req.params.id;
//     await models.appointment.update({
//       where: { id },
//       data: { deleted: true },
//     });
//     this.flash(FlashType.Success, { msg: "Appointment deleted successfully" });
//     this.redirect("/admin/appointments");
//   }

//   private async getAppointment(id: string) {
//     return await models.appointment.findFirst({
//       where: { id, deleted: false },
//       include: {
//         staff: true,
//         service: true,
//         staffSchedule: true,
//         createdBy: true,
//       },
//     });
//   }
// }


import { FlashType } from "@configs/enum";
import { Prisma } from "@db";
import models from "@models";
import {
  CreateAppointmentValidator,
  UpdateAppointmentValidator,
} from "@validators/admin.validator";
import { NotFoundError } from "ts-rails";
import { AdminController } from "./admin.controller";

const APPOINTMENT_STATUS = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELED",
  "NO_SHOW",
];

const SORT_FIELDS = [
  "createdAt",
  "appointmentDate",
  "appointmentCode",
  "customerName",
  "status",
];

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
        appointment,
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

  async create() {
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

    const appointmentDate = new Date(
      data.appointmentDate,
    );

    const appointmentCode =
      data.appointmentCode?.trim() ||
      (await this.generateAppointmentCode());

    await models.$transaction(
      async (tx) => {
        await this.validateAppointment(
          tx,
          {
            ...data,
            appointmentDate,
          },
        );

        const appointment =
          await tx.appointment.create({
            data: {
              ...data,
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

    const appointmentDate =
      data.appointmentDate
        ? new Date(
            data.appointmentDate,
          )
        : current.appointmentDate;

    await models.$transaction(
      async (tx) => {
        await this.validateAppointment(
          tx,
          {
            ...current,
            ...data,
            appointmentDate,
          },
          id,
        );

        await tx.appointment.update({
          where: { id },
          data: {
            ...data,
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

  private async validateAppointment(
    tx: Prisma.TransactionClient,
    data: any,
    excludeId?: string,
  ) {
    if (data.staffId) {
      const staff =
        await tx.user.findFirst({
          where: {
            id: data.staffId,
            deleted: false,
            status: "ACTIVE",
          },
        });

      if (!staff) {
        throw new Error(
          "Staff not found or inactive",
        );
      }
    }

    if (data.serviceId) {
      const service =
        await tx.service.findFirst({
          where: {
            id: data.serviceId,
            isActive: true,
          },
        });

      if (!service) {
        throw new Error(
          "Service not active",
        );
      }
    }

    if (data.staffScheduleId) {
      const schedule =
        await tx.staffSchedule.findFirst({
          where: {
            id: data.staffScheduleId,
            deleted: false,
            status: "ACTIVE",
          },
        });

      if (!schedule) {
        throw new Error(
          "Staff schedule not found",
        );
      }

      if (
        data.startTime <
          schedule.startTime ||
        data.endTime >
          schedule.endTime
      ) {
        throw new Error(
          "Appointment outside staff working hours",
        );
      }
    }

    if (
      data.staffId &&
      data.appointmentDate
    ) {
      const conflict =
        await tx.appointment.findFirst({
          where: {
            deleted: false,
            staffId: data.staffId,
            appointmentDate:
              data.appointmentDate,
            id: excludeId
              ? {
                  not: excludeId,
                }
              : undefined,
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

      if (conflict) {
        throw new Error(
          "Staff already has an appointment at this time",
        );
      }
    }
  }

  private async generateAppointmentCode() {
    const count =
      await models.appointment.count();

    return `APT-${String(
      count + 1,
    ).padStart(6, "0")}`;
  }

  private async getStaffs() {
    return models.user.findMany({
      where: {
        deleted: false,
        status: "ACTIVE",
        roles: {
          some: {
            role: {
              code: "STAFF",
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  private async getServices() {
    return models.service.findMany({
      where: {
        isActive: true,
      },
    });
  }

  private async getAppointment(
    id: string,
  ) {
    return models.appointment.findFirst(
      {
        where: {
          id,
          deleted: false,
        },
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