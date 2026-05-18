import { action, RailsRoute, RestActions } from "ts-rails";
import { AdminCustomerController } from "../../../app/controllers/admin/customer.controller";
import { fileUploader } from "../../../app/middlewares/fileUploader";

export class AdminCustomerRoute extends RailsRoute {
  public draw() {
    this.resource(AdminCustomerController, {
      setPermissionForAny: ["AM", "STAFF"],
      except: [RestActions.Create, RestActions.Update],
    });

    this.post(
      "/",
      [
        fileUploader.single("avatar"),
        action(AdminCustomerController, "create"),
      ],
      { setPermissionForAny: ["AM::CREATE", "STAFF::CREATE"] },
    );

    this.put(
      "/:id",
      [
        fileUploader.single("avatar"),
        action(AdminCustomerController, "update"),
      ],
      { setPermissionForAny: ["AM::UPDATE", "STAFF::UPDATE"] },
    );
  }
}
