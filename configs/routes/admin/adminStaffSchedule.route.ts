import { Feature } from "@configs/enum";
import { AdminStaffScheduleController } from "@controllers";
import { RailsRoute } from "ts-rails";

export class AdminStaffScheduleRoute extends RailsRoute {
  public draw() {
    this.resource(AdminStaffScheduleController, {
      setPermissionForAny: [
        Feature.AdministrationManagement,
        Feature.StaffScheduleManagement,
      ],
    });
  }
}