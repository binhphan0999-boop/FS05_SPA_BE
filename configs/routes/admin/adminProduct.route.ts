import { action, RailsRoute, RestActions } from "ts-rails";
import { AdminProductController } from "../../../app/controllers/admin/adminProduct.controller";
import { fileUploader } from "../../../app/middlewares/fileUploader";

export class AdminProductRoute extends RailsRoute {
  public draw() {
    this.resource(AdminProductController, {
      setPermissionForAny: ["AM", "PRODUCT"],
      except: [RestActions.Create, RestActions.Update],
    });

    this.post(
      "/",
      [fileUploader.single("image"), action(AdminProductController, "create")],
      { setPermissionForAny: ["AM::CREATE", "PRODUCT::CREATE"] },
    );

    this.put(
      "/:id",
      [fileUploader.single("image"), action(AdminProductController, "update")],
      { setPermissionForAny: ["AM::UPDATE", "PRODUCT::UPDATE"] },
    );
  }
}
