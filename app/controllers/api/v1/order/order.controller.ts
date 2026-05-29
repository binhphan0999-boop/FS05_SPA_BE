import { MailService } from "@services/mail/mail.service";
import { OrderService } from "@services/order/order.service";
import { CreateOrderValidator } from "@validators/order.validator";
import { ApiV1Controller } from "../apiV1.controller";

export class OrderController extends ApiV1Controller {
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

    // Gửi email thông báo (Dùng try-catch để không làm hỏng request nếu mail lỗi)
    try {
      if (order && order.user?.email) {
        const customerName =
          `${order.user.lastName} ${order.user.firstName}`.trim() ||
          "Quý khách";
        const subTotal = order.totalAmount;
        const discount = order.discountAmount || 0;
        const totalPayable = subTotal - discount;

        // Tạo danh sách sản phẩm
        const itemsHtml = order.items
          .map((item: any) => {
            // Xử lý lấy đường dẫn ảnh tuyệt đối
            const productImg = item.product.imgUrl
              ? item.product.imgUrl.startsWith("http")
                ? item.product.imgUrl
                : `${process.env.APP_URL || ""}${item.product.imgUrl}`
              : "https://via.placeholder.com/150";
            return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #edf2f7; color: #4a5568;">
              <img src="${productImg}" width="50" height="50" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover; vertical-align: middle; margin-right: 10px;" />
              <div style="display: inline-block; vertical-align: middle;">
                <div style="font-weight: 600;">${item.product.name}</div>
                <div style="font-size: 12px; color: #718096;">Mã SP: ${item.product.sku}</div>
              </div>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: center; color: #4a5568;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; color: #4a5568;">${item.price.toLocaleString("vi-VN")}đ</td>
          </tr>
        `;
          })
          .join("");

        await new MailService().sendMail(
          order.user.email,
          `Xác nhận đơn hàng #${order.id.split("-")[0].toUpperCase()} - Mona Beauty`,
          `
            <div style="background-color: #f7fafc; padding: 40px 10px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #d69e2e; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">MONA BEAUTY</h1>
                  <p style="color: rgba(255, 255, 255, 0.9); margin-top: 10px;">Cảm ơn bạn đã tin tưởng lựa chọn chúng tôi</p>
                </div>

                <!-- Body -->
                <div style="padding: 30px;">
                  <p style="font-size: 16px; color: #2d3748;">Xin chào <strong>${customerName}</strong>,</p>
                  <p style="font-size: 15px; color: #4a5568; line-height: 1.6;">Đơn hàng của bạn đã được xác nhận thành công và đang được chuẩn bị để giao tới bạn.</p>

                  <!-- Order Summary -->
                  <h3 style="color: #2d3748; border-bottom: 2px solid #edf2f7; padding-bottom: 10px; margin-top: 30px;">Chi tiết đơn hàng</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #f8fafc;">
                        <th style="padding: 12px; text-align: left; font-size: 14px; color: #718096; text-transform: uppercase;">Sản phẩm</th>
                        <th style="padding: 12px; text-align: center; font-size: 14px; color: #718096; text-transform: uppercase;">SL</th>
                        <th style="padding: 12px; text-align: right; font-size: 14px; color: #718096; text-transform: uppercase;">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- Totals -->
                  <div style="margin-top: 20px; padding: 20px; background-color: #f8fafc; border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #4a5568;">
                      <span style="flex: 1;">Tạm tính:</span>
                      <span style="font-weight: 600;">${subTotal.toLocaleString("vi-VN")}đ</span>
                    </div>
                    ${
                      discount > 0
                        ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #e53e3e;">
                      <span style="flex: 1;">Giảm giá (${order.coupon?.code || "Coupon"}):</span>
                      <span style="font-weight: 600;">-${discount.toLocaleString("vi-VN")}đ</span>
                    </div>`
                        : ""
                    }
                    <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #2d3748; font-size: 18px;">
                      <span style="flex: 1; font-weight: 700;">Tổng thanh toán:</span>
                      <span style="font-weight: 700; color: #d69e2e;">${totalPayable.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>

                  <!-- Shipping Info -->
                  <h3 style="color: #2d3748; border-bottom: 2px solid #edf2f7; padding-bottom: 10px; margin-top: 30px;">Địa chỉ giao hàng</h3>
                  <div style="font-size: 14px; color: #4a5568; line-height: 1.6; background-color: #fffaf0; padding: 15px; border-left: 4px solid #d69e2e;">
                    <div><strong>Người nhận:</strong> ${customerName}</div>
                    <div><strong>Điện thoại:</strong> ${order.deliveryPhone}</div>
                    <div><strong>Địa chỉ:</strong> ${order.deliveryAddress}</div>
                    ${order.deliveryNote ? `<div><strong>Ghi chú:</strong> ${order.deliveryNote}</div>` : ""}
                  </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #2d3748; padding: 20px; text-align: center;">
                  <p style="color: #ffffff; font-size: 14px; margin: 0;">Mona Beauty - Tỏa sáng mỗi ngày</p>
                  <p style="color: #a0aec0; font-size: 12px; margin: 5px 0 0;">Địa chỉ: 123 Đường ABC, Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>
              <p style="text-align: center; color: #a0aec0; font-size: 11px; margin-top: 20px;">Đây là email tự động từ hệ thống Mona Beauty. Vui lòng không phản hồi trực tiếp vào email này.</p>
            </div>
          `,
        );
      }
    } catch (mailError) {
      console.error("Lỗi gửi email xác nhận đơn hàng:", mailError);
    }

    this.renderJson({
      success: true,
      data: order,
    });
  }
}
