import models from "@models";

/**
 * Seeder cho bảng News và Comment
 */

async function getOrCreateNews(data: {
  title: string;
  slug: string;
  thumbnail: string;
  summary?: string;
  content: string;
}) {
  let news = await models.news.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (!news) {
    news = await models.news.create({
      data,
    });

    console.log(`[seedNews] Created news: ${data.title}`);
  }

  return news;
}

export async function seedNews() {
  try {
    // ===== CREATE NEWS =====

    const news1 = await getOrCreateNews({
      title: "Xu hướng làm đẹp 2024: Tự nhiên và Bền vững",
      slug: "xu-huong-lam-dep-2024-tu-nhien-va-ben-vung",
      thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
      summary: "Khám phá những xu hướng làm đẹp hàng đầu trong năm 2024.",
      content: `
        Năm 2024 đánh dấu sự lên ngôi của vẻ đẹp tự nhiên và bền vững.
        Người dùng ưu tiên các sản phẩm organic, ít hóa chất và
        có nguồn gốc rõ ràng.

        Ngoài ra skincare tối giản cũng đang trở thành xu hướng
        phổ biến trong cộng đồng làm đẹp.
      `,
    });

    const news2 = await getOrCreateNews({
      title: "Bí quyết chăm sóc da mùa hè không lo bắt nắng",
      slug: "bi-quyet-cham-soc-da-mua-he-khong-lo-bat-nang",
      thumbnail: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908",
      summary: "Làn da nhạy cảm cần được bảo vệ kỹ lưỡng dưới tác động tia UV.",
      content: `
        Mùa hè là thời điểm làn da dễ bị tổn thương bởi ánh nắng mặt trời.

        Việc sử dụng kem chống nắng đúng cách kết hợp dưỡng ẩm
        sẽ giúp da luôn khỏe mạnh và hạn chế lão hóa.
      `,
    });

    const news3 = await getOrCreateNews({
      title: "Lợi ích của việc massage tinh dầu đối với sức khỏe",
      slug: "loi-ich-cua-viec-massage-tinh-dau",
      thumbnail: "https://images.unsplash.com/photo-1544161515-436cefb657f8",
      summary: "Massage tinh dầu giúp thư giãn và cải thiện sức khỏe.",
      content: `
        Massage tinh dầu giúp giảm stress, cải thiện tuần hoàn máu
        và hỗ trợ giấc ngủ hiệu quả.

        Đây là liệu pháp được nhiều spa áp dụng nhằm nâng cao
        trải nghiệm thư giãn cho khách hàng.
      `,
    });

    // ===== CREATE COMMENTS =====

    const newsItems = [news1, news2, news3];

    for (const item of newsItems) {
      const existingComments = await models.comment.count({
        where: {
          newsId: item.id,
        },
      });

      if (existingComments === 0) {
        await models.comment.createMany({
          data: [
            {
              content: "Bài viết rất hữu ích, cảm ơn đã chia sẻ!",
              userName: "Minh Anh",
              userEmail: "minhanh@example.com",
              newsId: item.id,
            },
            {
              content: "Mình đã áp dụng thử và thấy hiệu quả.",
              userName: "Hoàng Yến",
              userEmail: "hoangyen@example.com",
              newsId: item.id,
            },
            {
              content: "Thông tin rất chi tiết và dễ hiểu.",
              userName: "Quốc Bảo",
              userEmail: "quocbao@example.com",
              newsId: item.id,
            },
          ],
        });

        console.log(`[seedNews] Created sample comments for: ${item.title}`);
      }
    }

    console.log("[seedNews] News and Comments seed data created successfully!");
  } catch (error) {
    console.error("[seedNews] Error seeding news:", error);
    throw error;
  }
}
