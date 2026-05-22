import { Router } from "express";
import {
  createNews,
  getAllNews,
  getNewsBySlug,
} from "../../../../../app/controllers/api/v1/news/news.controller";

const NewsRoute: Router = Router();

NewsRoute.get("/", getAllNews);
NewsRoute.get("/:slug", getNewsBySlug);
NewsRoute.post("/", createNews);

export default NewsRoute;
