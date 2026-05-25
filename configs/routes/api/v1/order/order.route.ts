import { OrderController } from "@controllers/api/v1/order/order.controller";
import { action, RailsRoute } from "ts-rails";

export class OrderRoute extends RailsRoute {
  public draw() {
    this.post("", action(OrderController, "create"));
  }
}
