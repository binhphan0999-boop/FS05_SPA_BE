import env from "@configs/env";
import { MyPermissionController } from "@controllers/api";
import { ValidateUserLoginMiddleware } from "@middlewares";
import { action, RailsRoute } from "ts-rails";
import { ApiV1AdminRoute } from "./admin";
import { AuthRoute } from "./auth";
import { CouponsRoute } from "./coupon/coupon.router";
import { ApiV1DevRoute } from "./dev";
import CommentRoute from "./news/comment.route";
import NewsRoute from "./news/new.route";
import { OrderRoute } from "./order/order.route";
import { ProductRoute } from "./products/product.route";
import { ServiceRoute } from "./services/service.route";

export class ApiV1Route extends RailsRoute {
  public draw() {
    if (env.nodeEnv === "development") {
      this.path("/dev", ApiV1DevRoute.draw());
    }

    this.path("/products", ProductRoute.draw());

    this.path("/services", ServiceRoute.draw());

    this.path("/news", NewsRoute);

    this.path("/comments", CommentRoute);

    this.path("/coupons", CouponsRoute.draw());

    this.path("/orders", OrderRoute.draw());

    this.path("/auth", AuthRoute.draw());

    this.path(action(ValidateUserLoginMiddleware));

    // Permission routes - action(Controller, "index") tạo instance mới mỗi request
    this.get("/permissions/me", action(MyPermissionController, "index"));

    // Admin routes - yêu cầu AM permission
    this.path("/admin", ApiV1AdminRoute.draw());
  }
}
