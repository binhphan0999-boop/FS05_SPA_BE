import { Feature } from "@configs/enum";
import { AdminStaffScheduleController } from "@controllers";
import { Permission } from "@middlewares";
import { action, RailsRoute } from "ts-rails";

export class AdminStaffScheduleRoute extends RailsRoute {
  public draw() {
    // Đăng ký API lấy danh sách nhân viên
    this.get("/getStaffs", action(AdminStaffScheduleController, "getStaffs"), {
      setPermissionForAny: [
        `${Feature.AdministrationManagement}::${Permission.Read}`,
        `${Feature.StaffScheduleManagement}::${Permission.Read}`,
      ],
    });

    this.resource(AdminStaffScheduleController, {
      setPermissionForAny: [
        Feature.AdministrationManagement,
        Feature.StaffScheduleManagement,
      ],
    });
  }
}