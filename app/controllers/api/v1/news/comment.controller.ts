// ====================================================
// app/controllers/api/v1/news/comment.controller.ts
// ====================================================

import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response } from "express";

import * as commentService from "../../../../services/news/comment.service";

import {
  CreateCommentValidator,
  UpdateCommentValidator,
} from "../../../../validators/comment.validator";

/**
 * CREATE COMMENT
 */
export async function createComment(req: Request, res: Response) {
  try {
    const dto = plainToInstance(CreateCommentValidator, req.body);

    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",

        errors: errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(", "),
        })),
      });
    }

    const comment = await commentService.createComment({
      content: dto.content,
      userName: dto.userName,
      userEmail: dto.userEmail,
      slug: dto.slug,
    });

    return res.status(201).json({
      success: true,
      data: comment,
      message: "Comment created successfully",
    });
  } catch (error) {
    console.error("[createComment] Error:", error);

    return res.status(500).json({
      success: false,
      message: "Create comment failed",
    });
  }
}

/**
 * GET COMMENTS BY NEWS ID
 */
export async function getCommentsByNewsId(req: Request, res: Response) {
  try {
    const { newsId } = req.params;

    if (!newsId) {
      return res.status(400).json({
        success: false,
        message: "newsId is required",
      });
    }

    const comments = await commentService.getCommentsByNewsId(newsId);

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("[getCommentsByNewsId] Error:", error);

    return res.status(500).json({
      success: false,
      message: "Get comments failed",
    });
  }
}

/**
 * GET COMMENT BY ID
 */
export async function getCommentById(req: Request, res: Response) {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "commentId is required",
      });
    }

    const comment = await commentService.getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("[getCommentById] Error:", error);

    return res.status(500).json({
      success: false,
      message: "Get comment failed",
    });
  }
}

/**
 * UPDATE COMMENT
 */
export async function updateComment(req: Request, res: Response) {
  try {
    const { commentId } = req.params;

    const dto = plainToInstance(UpdateCommentValidator, req.body);

    const errors = await validate(dto);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",

        errors: errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(", "),
        })),
      });
    }

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "commentId is required",
      });
    }

    const existingComment = await commentService.getCommentById(commentId);

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const comment = await commentService.updateComment(commentId, {
      content: dto.content,
    });

    return res.status(200).json({
      success: true,
      data: comment,
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("[updateComment] Error:", error);

    return res.status(500).json({
      success: false,
      message: "Update comment failed",
    });
  }
}

/**
 * DELETE COMMENT
 */
export async function deleteComment(req: Request, res: Response) {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "commentId is required",
      });
    }

    const existingComment = await commentService.getCommentById(commentId);

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    await commentService.deleteComment(commentId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("[deleteComment] Error:", error);

    return res.status(500).json({
      success: false,
      message: "Delete comment failed",
    });
  }
}
