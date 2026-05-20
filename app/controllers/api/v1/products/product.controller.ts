import { productService } from "@services/products/product.service";
import { ApiV1Controller } from "../apiV1.controller";

export class ProductController extends ApiV1Controller {
  async index() {
    try {
      const products = await productService.getProducts();

      this.renderJson(products);
    } catch (error) {
      this.renderJson({ error: (error as any).message }, 500);
    }
  }
}
