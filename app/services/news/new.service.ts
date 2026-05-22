import models from "@models";

export async function getAllNews() {
  return await models.news.findMany({
    include: {
      comments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getNewsBySlug(slug: string) {
  return await models.news.findUnique({
    where: {
      slug,
    },
    include: {
      comments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function createNews(data: {
  title: string;
  slug: string;
  thumbnail: string;
  summary?: string;
  content: string;
}) {
  return await models.news.create({
    data,
  });
}

/**
 * Tạo bình luận mới cho bài viết
 */
export async function createComment(data: {
  content: string;
  userName: string;
  userEmail?: string;
  newsId: string;
}) {
  return await models.comment.create({
    data,
  });
}

/**
 * Lấy danh sách bình luận của một bài viết
 */
export async function getCommentsByNewsId(newsId: string) {
  return await models.comment.findMany({
    where: { newsId },
    orderBy: {
      createdAt: "desc",
    },
  });
}
