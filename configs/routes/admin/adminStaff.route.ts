import { action, RailsRoute, RestActions } from "ts-rails";
import { AdminStaffController } from "../../../app/controllers/admin/staff.controller";
import { fileUploader } from "../../../app/middlewares/fileUploader";

export class AdminStaffRoute extends RailsRoute {
  public draw() {
    // Đăng ký các route chuẩn ngoại trừ create và update
    this.resource(AdminStaffController, {
      setPermissionForAny: ["AM", "STAFF"],
      except: [RestActions.Create, RestActions.Update],
    });

    // Đăng ký riêng create và update để gán middleware upload ảnh
    this.post(
      "/",
      [fileUploader.single("avatar"), action(AdminStaffController, "create")],
      { setPermissionForAny: ["AM::CREATE", "STAFF::CREATE"] },
    );

    this.put(
      "/:id",
      [fileUploader.single("avatar"), action(AdminStaffController, "update")],
      { setPermissionForAny: ["AM::UPDATE", "STAFF::UPDATE"] },
    );
  }
}
