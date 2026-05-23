import models from "@models";

export async function seedCoupons() {
  const coupons = [
    {
      code: "SALE10",
      description: "Giảm 10% toàn bộ đơn hàng",
      discountType: "PERCENT",
      discountValue: 10,
      minOrder: 200000,
      maxDiscount: 100000,
      quantity: 100,
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
    {
      code: "WELCOME50K",
      description: "Giảm 50k cho khách mới",
      discountType: "FIXED",
      discountValue: 50000,
      minOrder: 300000,
      quantity: 50,
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
  ];

  for (const data of coupons) {
    const existing = await models.coupon.findUnique({
      where: { code: data.code },
    });

    if (!existing) {
      await models.coupon.create({ data });
      console.log(`[seedCoupons] Created coupon: ${data.code}`);
    }
  }
  console.log("[seedCoupons] Coupon seed data created successfully!");
}
