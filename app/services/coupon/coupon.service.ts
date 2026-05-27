import { Prisma } from "@db";
import { BadRequestError, NotFoundError } from "ts-rails";
import { ApplicationService } from "../application.service";

export class CouponService extends ApplicationService {
  /**
   * Lấy danh sách coupon
   */
  async index(
    search: string = "",
    page: number = 1,
    perPage: number = 10,
    sortBy: string = "code",
    sortOrder: "asc" | "desc" = "asc",
  ) {
    const where: Prisma.CouponWhereInput = {};
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [coupons, total] = await Promise.all([
      this.models.coupon.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.models.coupon.count({ where }),
    ]);

    return { coupons, total };
  }

  /**
   * Lấy chi tiết coupon
   */
  async show(id: string) {
    const coupon = await this.models.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundError("Mã giảm giá không tồn tại.");
    }

    return coupon;
  }

  /**
   * Tạo coupon mới
   */
  async create(data: {
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    minOrder?: number;
    maxDiscount?: number;
    quantity: number;
    startDate: string | Date;
    endDate: string | Date;
    isActive?: boolean;
  }) {
    // Kiểm tra mã coupon đã tồn tại
    const existingCoupon = await this.models.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      throw new BadRequestError("Mã giảm giá này đã tồn tại.");
    }

    // Kiểm tra ngày hợp lệ
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new BadRequestError("Ngày kết thúc phải sau ngày bắt đầu.");
    }

    const coupon = await this.models.coupon.create({
      data: {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrder: data.minOrder,
        maxDiscount: data.maxDiscount,
        quantity: data.quantity,
        startDate,
        endDate,
        isActive: data.isActive ?? true,
      },
    });

    return coupon;
  }

  /**
   * Cập nhật coupon
   */
  async update(
    id: string,
    data: {
      code?: string;
      description?: string;
      discountType?: string;
      discountValue?: number;
      minOrder?: number;
      maxDiscount?: number;
      quantity?: number;
      startDate?: string | Date;
      endDate?: string | Date;
      isActive?: boolean;
    },
  ) {
    const coupon = await this.models.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundError("Mã giảm giá không tồn tại.");
    }

    // Kiểm tra mã coupon nếu thay đổi
    if (data.code && data.code !== coupon.code) {
      const existingCoupon = await this.models.coupon.findUnique({
        where: { code: data.code },
      });

      if (existingCoupon) {
        throw new BadRequestError("Mã giảm giá này đã tồn tại.");
      }
    }

    // Kiểm tra ngày hợp lệ nếu có thay đổi
    if (data.startDate || data.endDate) {
      const startDate = data.startDate
        ? new Date(data.startDate)
        : coupon.startDate;
      const endDate = data.endDate ? new Date(data.endDate) : coupon.endDate;

      if (startDate >= endDate) {
        throw new BadRequestError("Ngày kết thúc phải sau ngày bắt đầu.");
      }
    }

    const updateData: Prisma.CouponUpdateInput = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.discountType !== undefined)
      updateData.discountType = data.discountType;
    if (data.discountValue !== undefined)
      updateData.discountValue = data.discountValue;
    if (data.minOrder !== undefined) updateData.minOrder = data.minOrder;
    if (data.maxDiscount !== undefined)
      updateData.maxDiscount = data.maxDiscount;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.startDate !== undefined)
      updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedCoupon = await this.models.coupon.update({
      where: { id },
      data: updateData,
    });

    return updatedCoupon;
  }

  /**
   * Xóa coupon
   */
  async delete(id: string) {
    const coupon = await this.models.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundError("Mã giảm giá không tồn tại.");
    }

    return this.models.coupon.delete({
      where: { id },
    });
  }

  /**
   * Kiểm tra và tính toán giá trị giảm giá của coupon
   */
  async validate(code: string, orderAmount: number) {
    const coupon = await this.models.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      throw new NotFoundError(
        "Mã giảm giá không tồn tại hoặc đã bị ngừng áp dụng.",
      );
    }

    const now = new Date();
    if (now < coupon.startDate) {
      throw new BadRequestError("Chương trình giảm giá chưa bắt đầu.");
    }
    if (now > coupon.endDate) {
      throw new BadRequestError("Mã giảm giá đã hết hạn sử dụng.");
    }

    if (coupon.usedCount >= coupon.quantity) {
      throw new BadRequestError("Mã giảm giá đã hết lượt sử dụng.");
    }

    if (coupon.minOrder && orderAmount < coupon.minOrder) {
      throw new BadRequestError(
        `Đơn hàng chưa đạt giá trị tối thiểu (${coupon.minOrder.toLocaleString()}đ) để áp dụng mã này.`,
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENT") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      // Giới hạn mức giảm tối đa nếu có
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return {
      id: coupon.id,
      code: coupon.code,
      discountAmount,
    };
  }

  /**
   * Tăng số lần sử dụng coupon
   */
  async incrementUsedCount(id: string) {
    const coupon = await this.models.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundError("Mã giảm giá không tồn tại.");
    }

    return this.models.coupon.update({
      where: { id },
      data: { usedCount: coupon.usedCount + 1 },
    });
  }
}
