/**
 * Seeder cho các bảng e-commerce
 * Tạo sample data cho: categories, products, carts, cart_items, orders, order_items, payments, qr_codes
 */
import models from "@models";

const PRODUCT_DESCRIPTIONS = {
  default:
    "We think your skin should look and refreshed matter Nourish your outer inner beauty with our essential oil infused beauty products Lorem ipsum dolor sit amet, consectetur.",
};

// Helper function to get or create category
async function getOrCreateCategory(name: string, slug: string) {
  let category = await models.category.findFirst({
    where: { slug },
  });

  if (!category) {
    category = await models.category.create({
      data: { name, slug },
    });
    console.log(`[seedEcommerce] Created category: ${name}`);
  }
  return category;
}

// Helper function to get or create product
async function getOrCreateProduct(
  name: string,
  slug: string,
  sku: string,
  price: number,
  stock: number,
  categoryId: string,
  imageUrl?: string,
) {
  let product = await models.product.findFirst({
    where: { sku },
  });

  if (!product) {
    product = await models.product.create({
      data: {
        name,
        slug,
        description: PRODUCT_DESCRIPTIONS.default,
        content: `${name} - Premium quality beauty product`,
        price,
        stock,
        sku,
        categoryId,
        imgUrl: imageUrl || null,
        status: "ACTIVE",
      },
    });
    console.log(`[seedEcommerce] Created product: ${name}`);
  }
  return product;
}

export async function seedEcommerce() {
  try {
    // ===== CREATE CATEGORIES =====
    const beautyCategory = await getOrCreateCategory("Beauty", "beauty");
    const spaFashionCategory = await getOrCreateCategory(
      "Spa Fashion",
      "spa-fashion",
    );
    const cosmeticsCategory = await getOrCreateCategory(
      "Cosmetics",
      "cosmetics",
    );
    const fashionCategory = await getOrCreateCategory("Fashion", "fashion");
    const popularCategory = await getOrCreateCategory("Popular", "popular");

    // ===== CREATE PRODUCTS =====
    const products = [];

    // Body Care products
    products.push(
      await getOrCreateProduct(
        "Body Care",
        "body-care",
        "BODY-CARE-001",
        220000,
        50,
        beautyCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/prosuct-15.png",
      ),
    );

    products.push(
      await getOrCreateProduct(
        "Body Max",
        "body-max",
        "BODY-MAX-001",
        730000,
        30,
        spaFashionCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-4.png",
      ),
    );

    products.push(
      await getOrCreateProduct(
        "Body Sop",
        "body-sop",
        "BODY-SOP-001",
        780000,
        25,
        cosmeticsCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-11.png",
      ),
    );

    // Face Oil products
    products.push(
      await getOrCreateProduct(
        "Face Oil",
        "face-oil",
        "FACE-OIL-001",
        300000,
        40,
        spaFashionCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-3.png",
      ),
    );

    products.push(
      await getOrCreateProduct(
        "Face Oil Max",
        "face-oil-max",
        "FACE-OIL-MAX-001",
        200000,
        35,
        spaFashionCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-3.png",
      ),
    );

    // Hair Shine products
    products.push(
      await getOrCreateProduct(
        "Hair Shine",
        "hair-shine",
        "HAIR-SHINE-001",
        220000,
        45,
        beautyCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/prosuct-16.png",
      ),
    );

    products.push(
      await getOrCreateProduct(
        "Hair Shine Pro",
        "hair-shine-pro",
        "HAIR-SHINE-PRO-001",
        580000,
        20,
        popularCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-10.png",
      ),
    );

    // Hand Creams
    products.push(
      await getOrCreateProduct(
        "Hand Creams",
        "hand-creams",
        "HAND-CREAM-001",
        410000,
        55,
        cosmeticsCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-2.png",
      ),
    );

    // Lipstick products
    products.push(
      await getOrCreateProduct(
        "Lipstick",
        "lipstick",
        "LIPSTICK-001",
        220000,
        60,
        fashionCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-6.png",
      ),
    );

    products.push(
      await getOrCreateProduct(
        "Lipstick Max",
        "lipstick-max",
        "LIPSTICK-MAX-001",
        360000,
        38,
        popularCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-9.png",
      ),
    );

    products.push(
      await getOrCreateProduct(
        "Lipstick Pro",
        "lipstick-pro",
        "LIPSTICK-PRO-001",
        580000,
        28,
        popularCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-8.png",
      ),
    );

    // Massage Oil
    products.push(
      await getOrCreateProduct(
        "Massage Oil",
        "massage-oil",
        "MASSAGE-OIL-001",
        360000,
        32,
        popularCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-7.png",
      ),
    );

    // Nail Polish products
    products.push(
      await getOrCreateProduct(
        "Nail Polish",
        "nail-polish",
        "NAIL-POLISH-001",
        510000,
        48,
        spaFashionCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-t-5.png",
      ),
    );

    products.push(
      await getOrCreateProduct(
        "Nail Polish Premium",
        "nail-polish-premium",
        "NAIL-POLISH-PREMIUM-001",
        250000,
        52,
        popularCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-12.png",
      ),
    );

    // Safari products
    products.push(
      await getOrCreateProduct(
        "Safari",
        "safari",
        "SAFARI-001",
        320000,
        42,
        beautyCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-1.png",
      ),
    );

    products.push(
      await getOrCreateProduct(
        "Safari Max",
        "safari-max",
        "SAFARI-MAX-001",
        360000,
        36,
        beautyCategory.id,
        "https://beauty-blendz.monamedia.net/wp-content/uploads/2023/04/p-d-1-1.png",
      ),
    );

    // ===== GET USER =====
    let user = await models.user.findFirst({
      where: { email: "admin@example.com", deleted: false },
    });

    if (!user) {
      user = await models.user.findFirst({
        where: { deleted: false },
        take: 1,
      });
    }

    if (!user) {
      console.warn(
        "[seedEcommerce] No user found, skipping cart, order, payment",
      );
      return;
    }

    // ===== CREATE CART =====
    let cart = await models.cart.findFirst({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await models.cart.create({
        data: {
          userId: user.id,
        },
      });
      console.log("[seedEcommerce] Created cart for user");
    }

    // ===== CREATE CART ITEMS =====
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const existingItem = await models.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: products[i].id,
        },
      });

      if (!existingItem) {
        await models.cartItem.create({
          data: {
            cartId: cart.id,
            productId: products[i].id,
            quantity: i + 1,
          },
        });
        console.log(`[seedEcommerce] Created cart item: ${products[i].name}`);
      }
    }

    // ===== CREATE ORDER =====
    let order = await models.order.findFirst({
      where: { userId: user.id, status: "PENDING" },
      take: 1,
    });

    if (!order) {
      const totalAmount = products[0].price * 2 + products[1].price;
      order = await models.order.create({
        data: {
          userId: user.id,
          totalAmount: totalAmount,
          status: "PENDING",
          depositAmount: totalAmount / 2,
        },
      });
      console.log("[seedEcommerce] Created order");
    }

    // ===== CREATE ORDER ITEMS =====
    for (let i = 0; i < Math.min(2, products.length); i++) {
      const existingItem = await models.orderItem.findFirst({
        where: {
          orderId: order.id,
          productId: products[i].id,
        },
      });

      if (!existingItem) {
        await models.orderItem.create({
          data: {
            orderId: order.id,
            productId: products[i].id,
            quantity: i + 1,
            price: products[i].price,
          },
        });
        console.log(`[seedEcommerce] Created order item: ${products[i].name}`);
      }
    }

    // ===== CREATE PAYMENT =====
    let payment = await models.payment.findFirst({
      where: { orderId: order.id, status: "PENDING" },
      take: 1,
    });

    if (!payment) {
      payment = await models.payment.create({
        data: {
          orderId: order.id,
          amount: order.depositAmount || order.totalAmount,
          method: "MOMO",
          type: "DEPOSIT",
          status: "PENDING",
          txnRef: `TXN-${Date.now()}`,
        },
      });
      console.log("[seedEcommerce] Created payment");
    }

    // ===== CREATE QR_CODE =====
    let qrCode = await models.qRCode.findFirst({
      where: { orderId: order.id },
      take: 1,
    });

    if (!qrCode) {
      const expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + 7);

      qrCode = await models.qRCode.create({
        data: {
          orderId: order.id,
          code: `QR-${order.id.slice(0, 8).toUpperCase()}-${Date.now()}`,
          expiredAt: expiredAt,
        },
      });
      console.log("[seedEcommerce] Created QR code");
    }

    console.log("[seedEcommerce] E-commerce seed data created successfully!");
  } catch (error) {
    console.error("[seedEcommerce] Error during seeding:", error);
    throw error;
  }
}
