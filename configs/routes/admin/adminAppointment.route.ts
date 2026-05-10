import { Feature } from "@configs/enum";
import { AdminAppointmentController } from "@controllers";
import { RailsRoute } from "ts-rails";

export class AdminAppointmentRoute extends RailsRoute {
  public draw() {
    this.resource(AdminAppointmentController, {
      setPermissionForAny: [
        Feature.AdministrationManagement,
        Feature.UserManagement,
      ],
    });
  }
}