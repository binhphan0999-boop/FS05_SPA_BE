import { BadRequestError, NotFoundError } from "ts-rails";
import { ApplicationService } from "../application.service";

interface CreateOrderPayload {
  userId: string;
  totalAmount?: number;
  couponId?: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryNote?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price?: number;
  }>;
}

export class OrderService extends ApplicationService {
  /**
   * Tạo đơn hàng mới
   */
  async create(payload: CreateOrderPayload) {
    // 0. Lấy thông tin sản phẩm từ DB để lấy giá chính xác và tính tổng tiền
    const productIds = payload.items.map((item) => item.productId);
    const dbProducts = await this.models.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let totalAmount = 0;
    const validatedItems = payload.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundError(
          `Sản phẩm với ID ${item.productId} không tồn tại.`,
        );
      }
      const price = product.price;
      totalAmount += price * item.quantity;
      return { ...item, price };
    });

    // 1. Kiểm tra user tồn tại
    const user = await this.models.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new NotFoundError("User không tồn tại.");
    }

    // 2. Fallback delivery info từ user nếu không gửi
    let deliveryPhone = payload.deliveryPhone;
    let deliveryAddress = payload.deliveryAddress;

    if (!deliveryPhone && user.phoneNumber) {
      deliveryPhone = user.phoneNumber;
    }

    if (!deliveryAddress && user.address) {
      deliveryAddress = user.address;
    }

    // 3. Kiểm tra coupon nếu có
    let discountAmount: number | null = null;
    let couponId: string | null = null;

    if (payload.couponId) {
      const coupon = await this.models.coupon.findUnique({
        where: { id: payload.couponId },
      });

      if (!coupon) {
        throw new BadRequestError("Mã giảm giá không tồn tại.");
      }

      // Kiểm tra coupon còn hạn
      const now = new Date();
      if (coupon.startDate > now || coupon.endDate < now) {
        throw new BadRequestError("Mã giảm giá đã hết hạn.");
      }

      // Kiểm tra isActive
      if (!coupon.isActive) {
        throw new BadRequestError("Mã giảm giá không hoạt động.");
      }

      // Kiểm tra quantity
      if (coupon.quantity <= coupon.usedCount) {
        throw new BadRequestError("Mã giảm giá đã hết lượt sử dụng.");
      }

      // 5. Tính discountAmount
      let discount = 0;
      if (coupon.discountType === "PERCENT") {
        discount = (totalAmount * coupon.discountValue) / 100;
      } else if (coupon.discountType === "FIXED") {
        discount = coupon.discountValue;
      }

      // Kiểm tra minOrder
      if (coupon.minOrder && totalAmount < coupon.minOrder) {
        throw new BadRequestError(
          `Đơn hàng phải có giá trị tối thiểu ${coupon.minOrder}.`,
        );
      }

      // Kiểm tra maxDiscount
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }

      discountAmount = discount;
      couponId = payload.couponId;
    }

    // 6. Dùng transaction để tạo Order và OrderItems
    const order = await this.models.$transaction(async (tx) => {
      // Tạo Order
      const newOrder = await tx.order.create({
        data: {
          userId: payload.userId,
          totalAmount,
          couponId,
          discountAmount,
          deliveryPhone,
          deliveryAddress,
          deliveryNote: payload.deliveryNote,
          status: "PENDING",
        },
        include: {
          items: true,
          coupon: true,
          user: true,
        },
      });

      // Tạo OrderItems
      for (const item of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }

      // Nếu có coupon, tăng usedCount
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      // Lấy lại order với items
      return await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          coupon: true,
          user: true,
        },
      });
    });

    return order;
  }
}
