import { Feature } from "@configs/enum";
// Import trực tiếp từ file để tránh circular dependency từ @controllers index
import { Permission } from "@middlewares";
import { action, RailsRoute } from "ts-rails";
import { AdminAppointmentController } from "../../../app/controllers/admin/adminAppointment.controller";

export class AdminAppointmentRoute extends RailsRoute {
  public draw() {
    // Đăng ký custom routes TRƯỚC resource để tránh bị route /:id (show) chiếm quyền
    this.get("/getAvailableStaff", action(AdminAppointmentController, "getAvailableStaff"), {
      setPermissionForAny: [
        `${Feature.AdministrationManagement}::${Permission.Read}`,
        `${Feature.AppointmentManagement}::${Permission.Read}`,
      ],
    });

    this.get("/byDate", action(AdminAppointmentController, "byDate"), {
      setPermissionForAny: [
        `${Feature.AdministrationManagement}::${Permission.Read}`,
        `${Feature.AppointmentManagement}::${Permission.Read}`,
      ],
    });

    // Đăng ký các custom member routes TRƯỚC resource để tránh bị route /:id chiếm quyền
    this.get("/:id/payment", action(AdminAppointmentController, "payment"), {
      setPermissionForAny: [
        `${Feature.AdministrationManagement}::${Permission.Read}`,
        `${Feature.AppointmentManagement}::${Permission.Read}`,
      ],
    });

    this.post("/:id/markAsPaid", action(AdminAppointmentController, "markAsPaid"), {
      setPermissionForAny: [
        `${Feature.AdministrationManagement}::${Permission.Update}`,
        `${Feature.AppointmentManagement}::${Permission.Update}`,
      ],
    });

    this.resource(AdminAppointmentController, {
      setPermissionForAny: [
        Feature.AdministrationManagement,
        Feature.AppointmentManagement,
      ],
    });
  }
}