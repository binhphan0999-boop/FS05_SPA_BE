import { Feature } from "@configs/enum";
import { AdminController } from "@controllers";
import { RailsRoute, RestActions } from "ts-rails";
import { AdminAppointmentRoute } from "./adminAppointment.route";
import { AdminCustomerRoute } from "./adminCustomer.route";
import { AdminFeatureRoute } from "./adminFeature.route";
import { AdminNewsRoute } from "./adminNews.route";
import { AdminProductRoute } from "./adminProduct.route";
import { AdminProfileRoute } from "./adminProfile.route";
import { AdminRoleRoute } from "./adminRole.route";
import { AdminServiceRoute } from "./adminService.route";
import { AdminStaffRoute } from "./adminStaff.route";
import { AdminStaffScheduleRoute } from "./adminStaffSchedule.route";
import { AdminUserRoute } from "./adminUser.route";

export class AdminRoute extends RailsRoute {
  public draw() {
    this.path("/me", AdminProfileRoute.draw());
    this.path("/users", AdminUserRoute.draw());
    this.path("/roles", AdminRoleRoute.draw());
    this.path("/appointments", AdminAppointmentRoute.draw());
    this.path("/features", AdminFeatureRoute.draw());
    this.path("/staff", AdminStaffRoute.draw());
    this.path("/customers", AdminCustomerRoute.draw());
    this.path("/services", AdminServiceRoute.draw());
    this.path("/products", AdminProductRoute.draw());
    this.path("/news", AdminNewsRoute.draw());
    this.path("/staff-schedules", AdminStaffScheduleRoute.draw());

    this.resource(AdminController, {
      only: [RestActions.Index],
      setPermissionForAny: [
        Feature.AdministrationManagement,
        Feature.UserManagement,
        Feature.AppointmentManagement,
        Feature.StaffScheduleManagement,
        Feature.ServiceManagement,
      ],
    });
  }
}
