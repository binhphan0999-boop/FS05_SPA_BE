import { Request, Response } from "express";
import * as newsService from "../../../../services/news/new.service";

export async function getAllNews(req: Request, res: Response) {
  try {
    const news = await newsService.getAllNews();

    return res.json({
      success: true,
      data: news,
      message: "Get all news successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export async function getNewsBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    const news = await newsService.getNewsBySlug(slug);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    return res.json({
      success: true,
      data: news,
      message: "Get news detail successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export async function createNews(req: Request, res: Response) {
  try {
    const body = req.body as any;

    const news = await newsService.createNews(body);

    return res.status(201).json({
      success: true,
      data: news,
      message: "News created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Create news failed",
    });
  }
}
