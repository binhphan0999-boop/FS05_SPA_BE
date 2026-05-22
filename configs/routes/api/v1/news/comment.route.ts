import { Router } from "express";

import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsByNewsId,
  updateComment,
} from "../../../../../app/controllers/api/v1/news/comment.controller";

const CommentRoute: Router = Router();

/**
 * CREATE COMMENT
 * POST /api/v1/comments
 */
CommentRoute.post("/", createComment);

/**
 * GET COMMENTS BY NEWS ID
 * GET /api/v1/comments/news/:newsId
 */
CommentRoute.get("/news/:newsId", getCommentsByNewsId);

/**
 * GET COMMENT BY ID
 * GET /api/v1/comments/:commentId
 */
CommentRoute.get("/:commentId", getCommentById);

/**
 * UPDATE COMMENT
 * PUT /api/v1/comments/:commentId
 */
CommentRoute.put("/:commentId", updateComment);

/**
 * DELETE COMMENT
 * DELETE /api/v1/comments/:commentId
 */
CommentRoute.delete("/:commentId", deleteComment);

export default CommentRoute;
