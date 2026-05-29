import models from "@models";

async function getOrCreateServiceCategory(name: string, slug: string) {
  let category = await models.category.findFirst({ where: { slug } });
  if (!category) {
    category = await models.category.create({ data: { name, slug } });
    console.log(`[seedServices] Created category: ${name}`);
  }
  return category;
}

async function getOrCreateService(data: {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  categoryId: string;
  imageUrl: string;
  isFeatured?: boolean;
}) {
  const existing = await models.service.findFirst({ where: { name: data.name } });
  if (!existing) {
    const service = await models.service.create({
      data: { ...data, isActive: true, isFeatured: data.isFeatured ?? false },
    });
    console.log(`[seedServices] Created service: ${data.name}`);
    return service;
  }
  return existing;
}

export async function seedServices() {
  try {
    const massageCategory = await getOrCreateServiceCategory("Massage Trị Liệu", "massage-tri-lieu");
    const facialCategory = await getOrCreateServiceCategory("Chăm Sóc Da Mặt", "cham-soc-da-mat");
    const bodyCategory = await getOrCreateServiceCategory("Chăm Sóc Toàn Thân", "cham-soc-toan-than");
    const nailCategory = await getOrCreateServiceCategory("Nail & Tóc", "nail-toc");

    await getOrCreateService({
      name: "Swedish Massage",
      description: "Liệu pháp massage Thụy Điển nhẹ nhàng giúp giảm căng thẳng, cải thiện tuần hoàn máu và đem lại cảm giác thư giãn toàn diện. Phù hợp cho lần đầu trải nghiệm massage.",
      price: 450000,
      durationMinutes: 60,
      categoryId: massageCategory.id,
      imageUrl: "/images/image_53.jpg",
    });

    await getOrCreateService({
      name: "Deep Tissue Massage",
      description: "Massage sâu tác động vào các lớp cơ sâu hơn, hiệu quả trong việc giải tỏa các điểm căng cứng mãn tính, đau lưng và phục hồi sau chấn thương thể thao.",
      price: 600000,
      durationMinutes: 90,
      categoryId: massageCategory.id,
      imageUrl: "/images/image_54.jpg",
      isFeatured: true,
    });

    await getOrCreateService({
      name: "Hot Stone Therapy",
      description: "Liệu pháp đá nóng kết hợp giữa nhiệt độ và áp lực massage, giúp thư giãn cơ bắp sâu, cải thiện lưu thông máu và giảm các triệu chứng đau cơ hiệu quả.",
      price: 750000,
      durationMinutes: 90,
      categoryId: massageCategory.id,
      imageUrl: "/images/image_55.jpg",
    });

    await getOrCreateService({
      name: "Chăm Sóc Da Cơ Bản",
      description: "Gói chăm sóc da mặt cơ bản bao gồm làm sạch sâu, tẩy da chết, đắp mặt nạ dưỡng ẩm. Phục hồi làn da tươi sáng và mịn màng sau mỗi buổi trị liệu.",
      price: 350000,
      durationMinutes: 60,
      categoryId: facialCategory.id,
      imageUrl: "/images/image_56.jpg",
    });

    await getOrCreateService({
      name: "Trị Liệu Chống Lão Hóa",
      description: "Liệu trình chuyên sâu chống lão hóa sử dụng công nghệ hiện đại kết hợp serum cao cấp, giúp giảm nếp nhăn, cải thiện độ đàn hồi và trẻ hóa làn da hiệu quả.",
      price: 950000,
      durationMinutes: 75,
      categoryId: facialCategory.id,
      imageUrl: "/images/image_57.jpg",
      isFeatured: true,
    });

    await getOrCreateService({
      name: "Body Scrub & Wrap",
      description: "Tẩy tế bào chết toàn thân và ủ dưỡng ẩm chuyên sâu với các thành phần tự nhiên. Làn da được làm mịn, sáng và mềm mại tức thì sau liệu trình.",
      price: 550000,
      durationMinutes: 90,
      categoryId: bodyCategory.id,
      imageUrl: "/images/image_58.jpg",
    });

    await getOrCreateService({
      name: "Aromatherapy Spa",
      description: "Trải nghiệm spa thư giãn toàn thân với tinh dầu thiên nhiên cao cấp. Kết hợp kỹ thuật massage và hương liệu trị liệu giúp giải tỏa stress và cân bằng năng lượng.",
      price: 680000,
      durationMinutes: 120,
      categoryId: bodyCategory.id,
      imageUrl: "/images/image_59.jpg",
      isFeatured: true,
    });

    await getOrCreateService({
      name: "Manicure & Pedicure",
      description: "Chăm sóc móng tay và móng chân toàn diện: làm sạch, tạo hình, massage bàn tay và bàn chân, sơn gel bền màu. Đôi tay đôi chân đẹp hoàn hảo sau mỗi lần đến.",
      price: 280000,
      durationMinutes: 60,
      categoryId: nailCategory.id,
      imageUrl: "/images/image_60.jpg",
    });

    console.log("[seedServices] Service seed data created successfully!");
  } catch (error) {
    console.error("[seedServices] Error during seeding:", error);
    throw error;
  }
}
