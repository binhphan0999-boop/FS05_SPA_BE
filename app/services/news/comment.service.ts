import models from "@models";

interface CreateCommentPayload {
  content: string;

  userName: string;
  userEmail?: string;

  slug: string;
}

interface UpdateCommentPayload {
  content: string;
}

/**
 * CREATE COMMENT
 */
export async function createComment(data: CreateCommentPayload) {
  const news = await models.news.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (!news) {
    throw new Error("News not found");
  }

  return await models.comment.create({
    data: {
      content: data.content,

      userName: data.userName,
      userEmail: data.userEmail,

      newsId: news.id,
    },
  });
}

/**
 * GET COMMENTS BY NEWS ID
 */
export async function getCommentsByNewsId(newsId: string) {
  return await models.comment.findMany({
    where: {
      newsId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * GET COMMENT BY ID
 */
export async function getCommentById(commentId: string) {
  return await models.comment.findUnique({
    where: {
      id: commentId,
    },
  });
}

/**
 * UPDATE COMMENT
 */
export async function updateComment(
  commentId: string,
  data: UpdateCommentPayload,
) {
  return await models.comment.update({
    where: {
      id: commentId,
    },

    data,
  });
}

/**
 * DELETE COMMENT
 */
export async function deleteComment(commentId: string) {
  return await models.comment.delete({
    where: {
      id: commentId,
    },
  });
}
