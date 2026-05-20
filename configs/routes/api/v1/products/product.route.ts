import { ProductController } from "@controllers/api/v1/products/product.controller";
import { RailsRoute, RestActions } from "ts-rails";

export class ProductRoute extends RailsRoute {
  public draw() {
    this.resource(ProductController, {
      only: [RestActions.Index],
    });
  }
}
