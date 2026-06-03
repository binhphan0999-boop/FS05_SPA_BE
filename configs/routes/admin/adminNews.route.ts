import { action, RailsRoute, RestActions } from "ts-rails";
import { AdminNewsController } from "../../../app/controllers/admin/adminNews.controller";
import { fileUploader } from "../../../app/middlewares/fileUploader";

export class AdminNewsRoute extends RailsRoute {
  public draw() {
    this.resource(AdminNewsController, {
      setPermissionForAny: ["AM", "NEWS"],
      except: [RestActions.Create, RestActions.Update],
    });

    this.post(
      "/",
      [fileUploader.single("image"), action(AdminNewsController, "create")],
      { setPermissionForAny: ["AM::CREATE", "NEWS::CREATE"] },
    );

    this.put(
      "/:id",
      [fileUploader.single("image"), action(AdminNewsController, "update")],
      { setPermissionForAny: ["AM::UPDATE", "NEWS::UPDATE"] },
    );

    // Comment Management Routes
    this.post(
      "/:newsId/comments",
      [action(AdminNewsController, "createComment")],
      { setPermissionForAny: ["AM::CREATE", "NEWS::CREATE"] },
    );

    this.put(
      "/:newsId/comments/:commentId",
      [action(AdminNewsController, "updateComment")],
      { setPermissionForAny: ["AM::UPDATE", "NEWS::UPDATE"] },
    );

    this.delete(
      "/:newsId/comments/:commentId",
      [action(AdminNewsController, "deleteComment")],
      { setPermissionForAny: ["AM::DELETE", "NEWS::DELETE"] },
    );
  }
}
