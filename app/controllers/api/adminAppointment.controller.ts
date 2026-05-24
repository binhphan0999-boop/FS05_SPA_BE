import models from "@models";
import {
  CreateAppointmentValidator,
  UpdateAppointmentValidator,
} from "@validators/admin.validator";
import { ApiController } from "./api.controller";

export class AdminAppointmentController extends ApiController {
  private readonly permittedFields = [
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
  ];

  async index() {
    try {
      const search = String(this.req.query.search || "").trim();
      const status = String(this.req.query.status || "");
      const sortBy = String(this.req.query.sortBy || "createdAt");
      const sortOrder = (String(this.req.query.sortOrder || "desc").toLowerCase() === "asc" ? "asc" : "desc") as any;
      const page = Math.max(1, parseInt(String(this.req.query.page || "1"), 10));
      const perPage = Math.max(1, parseInt(String(this.req.query.perPage || "10"), 10));

      const where: any = { deleted: false };
      if (search) {
        where.OR = [
          { appointmentCode: { contains: search, mode: "insensitive" } },
          { customerName: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search, mode: "insensitive" } },
          {
            staff: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            },
          },
          {
            service: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [appointments, total] = await Promise.all([
        models.appointment.findMany({
          where,
          include: {
            staff: true,
            service: true,
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        models.appointment.count({ where }),
      ]);

      return this.res.json({
        success: true,
        data: appointments,
        meta: {
          total,
          page,
          perPage,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } catch (error: any) {
      return this.res.status(500).json({ success: false, message: error.message });
    }
  }

  async show() {
    try {
      const id = this.req.params.id;
      const appointment = await models.appointment.findFirst({
        where: { id, deleted: false },
        include: {
          staff: true,
          service: true,
          createdBy: true,
        },
      });
      if (!appointment) return this.res.status(404).json({ success: false, message: "Appointment not found" });

      return this.res.json({ success: true, data: appointment });
    } catch (error: any) {
      return this.res.status(500).json({ success: false, message: error.message });
    }
  }

  async create() {
    try {
      const data = await this.params(CreateAppointmentValidator).permit(...this.permittedFields as any);

      if (data.appointmentDate) {
        data.appointmentDate = new Date(data.appointmentDate).toISOString();
      }

      const appointment = await models.appointment.create({ data });
      return this.res.status(201).json({ success: true, data: appointment });
    } catch (error: any) {
      return this.res.status(400).json({ success: false, message: error.message });
    }
  }

  async update() {
    try {
      const id = this.req.params.id;

      const data = await this.params(UpdateAppointmentValidator).permit(...this.permittedFields as any);

      const updateData = { ...data };
      if (updateData.appointmentDate) {
        updateData.appointmentDate = new Date(updateData.appointmentDate).toISOString();
      }

      const appointment = await models.appointment.update({
        where: { id },
        data: updateData,
      });
      return this.res.json({ success: true, data: appointment });
    } catch (error: any) {
      return this.res.status(400).json({ success: false, message: error.message });
    }
  }

  async destroy() {
    try {
      const id = this.req.params.id;
      await models.appointment.update({
        where: { id },
        data: { deleted: true },
      });
      return this.res.json({ success: true, message: "Appointment deleted successfully" });
    } catch (error: any) {
      return this.res.status(400).json({ success: false, message: error.message });
    }
  }
}