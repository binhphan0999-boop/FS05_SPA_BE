import { FlashType } from "@configs/enum";
import { Prisma } from "@db";
import models from "@models";
import {
  CreateAppointmentValidator,
  UpdateAppointmentValidator,
} from "@validators/admin.validator";
import { NotFoundError } from "ts-rails";
import { AdminController } from "./admin.controller";

export class AdminAppointmentController extends AdminController {
  async index() {
    const search = String(this.req.query.search || "").trim();
    const sortBy = String(this.req.query.sortBy || "createdAt");
    const sortOrder = String(this.req.query.sortOrder || "desc") as
      | "asc"
      | "desc";
    const filterStatus = String(this.req.query.filterStatus || "");
    const page = Math.max(1, parseInt(String(this.req.query.page || "1"), 10));
    const perPage = Math.min(
      50,
      Math.max(10, parseInt(String(this.req.query.perPage || "10"), 10)),
    );

    const where: Prisma.AppointmentWhereInput = {};
    if (search) {
      where.OR = [
        { appointmentCode: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { staffName: { contains: search } },
        { serviceName: { contains: search } },
      ];
    }
    if (filterStatus) where.status = filterStatus;

    const [appointments, total] = await Promise.all([
      models.appointment.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      models.appointment.count({ where }),
    ]);

    const q: Record<string, string> = {};
    if (search) q.search = search;
    if (sortBy !== "createdAt") q.sortBy = sortBy;
    if (sortOrder !== "desc") q.sortOrder = sortOrder;
    if (filterStatus) q.filterStatus = filterStatus;
    if (perPage !== 10) q.perPage = String(perPage);

    const buildQueryString = () =>
      Object.keys(q).length ? "&" + new URLSearchParams(q).toString() : "";

    const buildSortUrl = (col: string) => {
      const next = sortBy === col && sortOrder === "asc" ? "desc" : "asc";
      return `/admin/appointments?${new URLSearchParams({ ...q, sortBy: col, sortOrder: next, page: "1" }).toString()}`;
    };

    this.render("admin/appointment.view/index", {
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
    });
  }

  async show() {
    const appointment = await this.getAppointment(this.req.params.id);
    if (!appointment) throw new NotFoundError("Appointment not found");

    this.render("admin/appointment.view/show", {
      user: this.req.user,
      appointment,
    });
  }

  async new() {
    this.render("admin/appointment.view/new", {
      user: this.req.user,
    });
  }

  async create() {
    const data = await this.params(CreateAppointmentValidator).permit(
      "appointmentCode",
      "customerName",
      "customerPhone",
      "staffName",
      "serviceName",
      "roomName",
      "appointmentDate",
      "startTime",
      "endTime",
      "status",
      "note",
      "cancellationReason",
      "createdBy",
    );

    const appointment = await models.appointment.create({
      data,
    });

    this.flash(FlashType.Success, {
      msg: `Created appointment ${appointment.appointmentCode}`,
    });
    this.redirect("/admin/appointments");
  }

  async edit() {
    const appointment = await this.getAppointment(this.req.params.id);
    if (!appointment) throw new NotFoundError("Appointment not found");

    this.render("admin/appointment.view/edit", {
      user: this.req.user,
      appointment,
    });
  }

  async update() {
    const id = this.req.params.id;
    const allPermittedFields = [
      "appointmentCode", "customerName", "customerPhone", "staffName", 
      "serviceName", "roomName", "appointmentDate", "startTime", 
      "endTime", "status", "note", "cancellationReason", "createdBy"
    ];

    const fieldsToPermit = allPermittedFields.filter(field => Object.prototype.hasOwnProperty.call(this.req.body, field));

    const data = await this.params(UpdateAppointmentValidator).permit(...fieldsToPermit as any);

    const appointment = await models.appointment.update({
      where: { id: parseInt(id, 10) },
      data,
    });

    this.flash(FlashType.Success, { msg: "Appointment updated successfully" });
    this.redirect(`/admin/appointments/${appointment.id}`);
  }

  async destroy() {
    const id = this.req.params.id;
    await models.appointment.delete({
      where: { id: parseInt(id, 10) },
    });
    this.flash(FlashType.Success, { msg: "Appointment deleted successfully" });
    this.redirect("/admin/appointments");
  }

  private async getAppointment(id: string) {
    const appointmentId = parseInt(id, 10);
    if (isNaN(appointmentId)) return null;
    return await models.appointment.findFirst({
      where: { id: appointmentId },
    });
  }
}