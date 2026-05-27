import { CouponsController } from "@controllers/api/v1/coupon/coupon.controller";
import { RailsRoute } from "ts-rails";
import { action } from "ts-rails";

export class CouponsRoute extends RailsRoute {
  public draw() {
    this.resource(CouponsController);
    this.post("/validate", action(CouponsController, "validate"));
  }
}
