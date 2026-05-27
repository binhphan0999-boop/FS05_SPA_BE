import { Feature } from "@configs/enum";
import { ApiV1AdminServiceController } from "@controllers/api/v1/admin/adminService.controller";
import { RailsRoute } from "ts-rails";

export class ApiV1AdminServiceRoute extends RailsRoute {
  public draw() {
    this.resource(ApiV1AdminServiceController, {
      document: { tags: ["Admin Service"] },
      setPermissionForAny: [Feature.ServiceManagement, Feature.AdministrationManagement],
    });
  }
}
