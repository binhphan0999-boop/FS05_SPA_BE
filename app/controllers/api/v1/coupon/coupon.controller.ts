import { CouponService } from "@services";
import {
  CouponCreateValidator,
  CouponUpdateValidator,
} from "@validators/coupon.validator";
import { validate } from "class-validator";
import { ApplicationController } from "../../../application.controller";

export class CouponsController extends ApplicationController {
  /**
   * GET /api/coupons
   */
  async index() {
    const search = String(this.params.search || "").trim();
    const page = Math.max(1, parseInt(String(this.params.page || "1"), 10));
    const perPage = Math.min(
      50,
      Math.max(10, parseInt(String(this.params.perPage || "10"), 10)),
    );
    const sortBy = String(this.params.sortBy || "code");
    const sortOrder = String(this.params.sortOrder || "asc") as "asc" | "desc";

    const couponService = new CouponService();
    const { coupons, total } = await couponService.index(
      search,
      page,
      perPage,
      sortBy,
      sortOrder,
    );

    return this.res.json({
      data: coupons,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  }

  /**
   * GET /api/coupons/:id
   */
  async show() {
    const couponId = this.params.id;

    const couponService = new CouponService();
    const coupon = await couponService.show(couponId);

    return this.res.json({
      data: coupon,
    });
  }

  /**
   * POST /api/coupons
   */
  async create() {
    const input = new CouponCreateValidator();
    Object.assign(input, this.params);

    const errors = await validate(input);
    if (errors.length > 0) {
      const messages = errors.reduce(
        (acc, err) => {
          acc[err.property] = Object.values(err.constraints || {}).join(", ");
          return acc;
        },
        {} as Record<string, string>,
      );

      return this.res
        .status(422)
        .json({ message: "Validation failed", errors: messages });
    }

    const couponService = new CouponService();
    const coupon = await couponService.create({
      code: input.code!,
      description: input.description!,
      discountType: input.discountType!,
      discountValue: input.discountValue!,
      minOrder: input.minOrder!,
      maxDiscount: input.maxDiscount!,
      quantity: input.quantity!,
      startDate: input.startDate!,
      endDate: input.endDate!,
      isActive: input.isActive!,
    });

    return this.res.status(201).json({
      message: "Tạo mã giảm giá thành công",
      data: coupon,
    });
  }

  /**
   * PUT /api/coupons/:id
   */
  async update() {
    const couponId = this.params.id;

    const input = new CouponUpdateValidator();
    Object.assign(input, this.params);

    const errors = await validate(input);
    if (errors.length > 0) {
      const messages = errors.reduce(
        (acc, err) => {
          acc[err.property] = Object.values(err.constraints || {}).join(", ");
          return acc;
        },
        {} as Record<string, string>,
      );

      return this.res
        .status(422)
        .json({ message: "Validation failed", errors: messages });
    }

    const couponService = new CouponService();
    const coupon = await couponService.update(couponId, {
      code: input.code!,
      description: input.description!,
      discountType: input.discountType!,
      discountValue: input.discountValue!,
      minOrder: input.minOrder!,
      maxDiscount: input.maxDiscount!,
      quantity: input.quantity!,
      startDate: input.startDate!,
      endDate: input.endDate!,
      isActive: input.isActive!,
    });

    return this.res.json({
      message: "Cập nhật mã giảm giá thành công",
      data: coupon,
    });
  }

  /**
   * DELETE /api/coupons/:id
   */
  async destroy() {
    const couponId = this.params.id;

    const couponService = new CouponService();
    await couponService.delete(couponId);

    return this.res.json({
      message: "Xóa mã giảm giá thành công",
    });
  }

  /**
   * POST /api/coupons/validate
   * Body: { code: string, totalAmount: number }
   */
  async validate() {
    const { code, totalAmount } = this.params;

    if (!code || !totalAmount) {
      return this.res
        .status(400)
        .json({ message: "Thiếu thông tin mã hoặc tổng tiền đơn hàng." });
    }

    const couponService = new CouponService();
    const result = await couponService.validate(code, Number(totalAmount));

    return this.res.json({
      data: result,
    });
  }
}
