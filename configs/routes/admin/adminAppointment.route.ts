import { Feature } from "@configs/enum";
import { AdminAppointmentController } from "@controllers";
import { Permission } from "@middlewares";
import { action, RailsRoute } from "ts-rails";

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

    this.resource(AdminAppointmentController, {
      setPermissionForAny: [
        Feature.AdministrationManagement,
        Feature.AppointmentManagement,
      ],
    });
  }
}