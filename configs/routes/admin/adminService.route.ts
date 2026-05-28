import { action, RailsRoute, RestActions } from "ts-rails";
import { AdminServiceController } from "../../../app/controllers/admin/adminService.controller";
import { fileUploader } from "../../../app/middlewares/fileUploader";

export class AdminServiceRoute extends RailsRoute {
  public draw() {
    this.resource(AdminServiceController, {
      setPermissionForAny: ["AM", "SERVICE"],
      except: [RestActions.Create, RestActions.Update],
    });

    this.post(
      "/",
      [
        fileUploader.single("image"),
        action(AdminServiceController, "create"),
      ],
      { setPermissionForAny: ["AM::CREATE", "SERVICE::CREATE"] },
    );

    this.put(
      "/:id",
      [
        fileUploader.single("image"),
        action(AdminServiceController, "update"),
      ],
      { setPermissionForAny: ["AM::UPDATE", "SERVICE::UPDATE"] },
    );
  }
}
