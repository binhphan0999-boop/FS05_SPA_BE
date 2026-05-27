import { OrderService } from "@services/order/order.service";
import { CreateOrderValidator } from "@validators/order.validator";
import { ApiV1Controller } from "../apiV1.controller";

export class OrderController extends ApiV1Controller {
  /**
   * CREATE ORDER
   * POST /api/v1/orders
   */
  async create() {
    const {
      userId,
      totalAmount,
      couponId,
      deliveryPhone,
      deliveryAddress,
      deliveryNote,
      items,
    } = await this.params(CreateOrderValidator).permit(
      "userId",
      "totalAmount",
      "couponId",
      "deliveryPhone",
      "deliveryAddress",
      "deliveryNote",
      "items",
    );

    const order = await new OrderService().create({
      userId,
      totalAmount,
      couponId,
      deliveryPhone,
      deliveryAddress,
      deliveryNote,
      items,
    });

    this.renderJson({
      success: true,
      data: order,
    });
  }
}
