import { Prisma } from "@db";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import {
  CreateCommentValidator,
  UpdateCommentValidator,
} from "../../../app/validators/admin.validator";
import { FlashType } from "../../../configs/enum";
import { getStorageAdapter } from "../../../lib/utils/storage";
import { AdminController } from "./admin.controller";

export class AdminNewsController extends AdminController {
  async index() {
    const pickStr = (v: unknown): string => {
      if (Array.isArray(v)) v = v.find((x) => x != null && x !== "") ?? "";
      return v == null ? "" : String(v);
    };
    const ALLOWED_SORT = new Set(["title", "createdAt"]);

    const page = Math.max(1, parseInt(pickStr(this.req.query.page) || "1", 10));
    const perPage = Math.min(
      50,
      Math.max(10, parseInt(pickStr(this.req.query.perPage) || "10", 10)),
    );
    const search = pickStr(this.req.query.search).trim();
    const sortByRaw = pickStr(this.req.query.sortBy) || "createdAt";
    const sortBy = ALLOWED_SORT.has(sortByRaw) ? sortByRaw : "createdAt";
    const sortOrder: "asc" | "desc" =
      pickStr(this.req.query.sortOrder) === "asc" ? "asc" : "desc";

    const where: Prisma.NewsWhereInput = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [news, total] = await Promise.all([
      this.models.news.findMany({
        where,
        include: { comments: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.models.news.count({ where }),
    ]);

    const q: Record<string, string> = {};
    if (search) q.search = search;
    if (sortBy !== "createdAt") q.sortBy = sortBy;
    if (sortOrder !== "desc") q.sortOrder = sortOrder;
    if (perPage !== 10) q.perPage = String(perPage);

    const buildQueryString = () =>
      Object.keys(q).length ? "&" + new URLSearchParams(q).toString() : "";
    const buildSortUrl = (col: string) => {
      const next = sortBy === col && sortOrder === "desc" ? "asc" : "desc";
      return `/admin/news?${new URLSearchParams({ ...q, sortBy: col, sortOrder: next, page: "1" }).toString()}`;
    };

    this.render("admin/news.view/index", {
      news,
      total,
      page,
      perPage,
      search,
      sortBy,
      sortOrder,
      activeMenu: "news",
      buildQueryString,
      buildSortUrl,
    });
  }

  async new() {
    this.render("admin/news.view/new", {
      activeMenu: "news",
    });
  }

  async create() {
    const body = this.req.body || {};
    const title = String(body.title || "").trim();
    const summary = String(body.summary || "").trim();
    const content = String(body.content || "").trim();
    let thumbnail = String(body.thumbnail || "").trim();

    // Validation
    if (!title) {
      this.flash(FlashType.Errors, { msg: "Tiêu đề tin tức là bắt buộc." });
      return this.redirect("/admin/news/new");
    }
    if (!content) {
      this.flash(FlashType.Errors, { msg: "Nội dung tin tức là bắt buộc." });
      return this.redirect("/admin/news/new");
    }
    if (!thumbnail && !(this.req as any).file) {
      this.flash(FlashType.Errors, { msg: "Ảnh đại diện là bắt buộc." });
      return this.redirect("/admin/news/new");
    }

    try {
      const file = (this.req as any).file;
      if (file) {
        const storageAdapter = getStorageAdapter();
        const uploadedUrl = await storageAdapter.upload(file);
        if (uploadedUrl) thumbnail = uploadedUrl;
      }

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check if slug already exists
      const existingSlug = await this.models.news.findUnique({
        where: { slug },
      });
      if (existingSlug) {
        this.flash(FlashType.Errors, { msg: "Slug này đã tồn tại." });
        return this.redirect("/admin/news/new");
      }

      const article = await this.models.news.create({
        data: {
          title,
          slug,
          summary: summary || null,
          content,
          thumbnail,
        },
      });

      this.flash(FlashType.Success, {
        msg: `Đã tạo tin tức "${article.title}".`,
      });
      this.redirect(`/admin/news/${article.id}`);
    } catch (error: any) {
      this.flash(FlashType.Errors, { msg: error.message });
      this.redirect("/admin/news/new");
    }
  }

  async show() {
    const article = await this.models.news.findUnique({
      where: { id: this.req.params.id },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    });
    if (!article) return this.redirect("/admin/news");

    this.render("admin/news.view/show", {
      article,
      activeMenu: "news",
    });
  }

  async edit() {
    const article = await this.models.news.findUnique({
      where: { id: this.req.params.id },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    });
    if (!article) return this.redirect("/admin/news");

    this.render("admin/news.view/edit", {
      article,
      activeMenu: "news",
    });
  }

  async update() {
    const id = this.req.params.id;
    const existing = await this.models.news.findUnique({ where: { id } });
    if (!existing) return this.redirect("/admin/news");

    const body = this.req.body || {};
    const data: Prisma.NewsUpdateInput = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        this.flash(FlashType.Errors, { msg: "Tiêu đề tin tức là bắt buộc." });
        return this.redirect(`/admin/news/${id}/edit`);
      }
      data.title = title;

      // Auto-generate slug from title
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check if new slug conflicts (excluding current)
      if (slug !== existing.slug) {
        const conflictSlug = await this.models.news.findUnique({
          where: { slug },
        });
        if (conflictSlug) {
          this.flash(FlashType.Errors, { msg: "Slug này đã tồn tại." });
          return this.redirect(`/admin/news/${id}/edit`);
        }
      }
      data.slug = slug;
    }

    if (body.summary !== undefined) {
      const summary = String(body.summary).trim();
      data.summary = summary || null;
    }

    if (body.content !== undefined) {
      const content = String(body.content).trim();
      if (!content) {
        this.flash(FlashType.Errors, { msg: "Nội dung tin tức là bắt buộc." });
        return this.redirect(`/admin/news/${id}/edit`);
      }
      data.content = content;
    }

    if (body.thumbnail !== undefined) {
      const url = String(body.thumbnail).trim();
      if (!url) {
        this.flash(FlashType.Errors, { msg: "Ảnh đại diện là bắt buộc." });
        return this.redirect(`/admin/news/${id}/edit`);
      }
      data.thumbnail = url;
    }

    const file = (this.req as any).file;
    if (file) {
      const storageAdapter = getStorageAdapter();
      const uploadedUrl = await storageAdapter.upload(file);
      if (uploadedUrl) data.thumbnail = uploadedUrl;
    }

    await this.models.news.update({ where: { id }, data });

    this.flash(FlashType.Success, { msg: "Đã cập nhật tin tức." });
    this.redirect(`/admin/news/${id}`);
  }

  async destroy() {
    const id = this.req.params.id;
    const existing = await this.models.news.findUnique({ where: { id } });
    if (!existing) return this.redirect("/admin/news");

    // Delete related comments first
    await this.models.comment.deleteMany({
      where: { newsId: id },
    });

    // Delete the news
    await this.models.news.delete({
      where: { id },
    });

    this.flash(FlashType.Success, {
      msg: `Đã xoá tin tức "${existing.title}".`,
    });
    this.redirect("/admin/news");
  }

  // Comment Management Methods
  async createComment() {
    const newsId = this.req.params.newsId;
    const body = this.req.body || {};

    // Validate input
    const validator = plainToClass(CreateCommentValidator, body);
    const errors = await validate(validator);
    if (errors.length > 0) {
      const messages = errors
        .map((e) => Object.values(e.constraints || {}).join(", "))
        .join("; ");
      this.flash(FlashType.Errors, { msg: messages });
      return this.redirect(`/admin/news/${newsId}`);
    }

    try {
      const news = await this.models.news.findUnique({ where: { id: newsId } });
      if (!news) {
        this.flash(FlashType.Errors, { msg: "Tin tức không tồn tại." });
        return this.redirect("/admin/news");
      }

      const { content, userName, userEmail } = validator;
      await this.models.comment.create({
        data: {
          content: content.trim(),
          userName: userName.trim(),
          userEmail: userEmail ? userEmail.trim() : null,
          newsId,
        },
      });

      this.flash(FlashType.Success, { msg: "Đã thêm bình luận." });
      this.redirect(`/admin/news/${newsId}`);
    } catch (error: any) {
      this.flash(FlashType.Errors, { msg: error.message });
      this.redirect(`/admin/news/${newsId}`);
    }
  }

  async updateComment() {
    const commentId = this.req.params.commentId;
    const newsId = this.req.params.newsId;
    const body = this.req.body || {};

    // Validate input
    const validator = plainToClass(UpdateCommentValidator, body);
    const errors = await validate(validator);
    if (errors.length > 0) {
      const messages = errors
        .map((e) => Object.values(e.constraints || {}).join(", "))
        .join("; ");
      this.flash(FlashType.Errors, { msg: messages });
      return this.redirect(`/admin/news/${newsId}`);
    }

    try {
      const comment = await this.models.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        this.flash(FlashType.Errors, { msg: "Bình luận không tồn tại." });
        return this.redirect(`/admin/news/${newsId}`);
      }

      const data: any = {};
      if (validator.content !== undefined)
        data.content = validator.content.trim();
      if (validator.userName !== undefined)
        data.userName = validator.userName.trim();
      if (validator.userEmail !== undefined)
        data.userEmail = validator.userEmail
          ? validator.userEmail.trim()
          : null;

      if (Object.keys(data).length === 0) {
        this.flash(FlashType.Errors, { msg: "Không có dữ liệu để cập nhật." });
        return this.redirect(`/admin/news/${newsId}`);
      }

      await this.models.comment.update({
        where: { id: commentId },
        data,
      });

      this.flash(FlashType.Success, { msg: "Đã cập nhật bình luận." });
      this.redirect(`/admin/news/${newsId}`);
    } catch (error: any) {
      this.flash(FlashType.Errors, { msg: error.message });
      this.redirect(`/admin/news/${newsId}`);
    }
  }

  async deleteComment() {
    const commentId = this.req.params.commentId;
    const newsId = this.req.params.newsId;

    try {
      const comment = await this.models.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        this.flash(FlashType.Errors, { msg: "Bình luận không tồn tại." });
        return this.redirect(`/admin/news/${newsId}`);
      }

      await this.models.comment.delete({
        where: { id: commentId },
      });

      this.flash(FlashType.Success, { msg: "Đã xoá bình luận." });
      this.redirect(`/admin/news/${newsId}`);
    } catch (error: any) {
      this.flash(FlashType.Errors, { msg: error.message });
      this.redirect(`/admin/news/${newsId}`);
    }
  }
}
