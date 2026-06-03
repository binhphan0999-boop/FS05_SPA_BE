import { Prisma } from "@db";
import { FlashType } from "../../../configs/enum";
import { getStorageAdapter } from "../../../lib/utils/storage";
import { AdminController } from "./admin.controller";

export class AdminProductController extends AdminController {
  async index() {
    const pickStr = (v: unknown): string => {
      if (Array.isArray(v)) v = v.find((x) => x != null && x !== "") ?? "";
      return v == null ? "" : String(v);
    };
    const ALLOWED_SORT = new Set([
      "name",
      "price",
      "stock",
      "status",
      "createdAt",
    ]);

    const page = Math.max(1, parseInt(pickStr(this.req.query.page) || "1", 10));
    const perPage = Math.min(
      50,
      Math.max(10, parseInt(pickStr(this.req.query.perPage) || "10", 10)),
    );
    const search = pickStr(this.req.query.search).trim();
    const sortByRaw = pickStr(this.req.query.sortBy) || "name";
    const sortBy = ALLOWED_SORT.has(sortByRaw) ? sortByRaw : "name";
    const sortOrder: "asc" | "desc" =
      pickStr(this.req.query.sortOrder) === "desc" ? "desc" : "asc";
    const filterStatus = pickStr(this.req.query.filterStatus);
    const filterCategory = pickStr(this.req.query.filterCategory);

    const where: Prisma.ProductWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }
    if (filterStatus && filterStatus !== "ALL") {
      where.status = filterStatus;
    }
    if (filterCategory) where.categoryId = filterCategory;

    const [products, total, categories] = await Promise.all([
      this.models.product.findMany({
        where,
        include: { category: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.models.product.count({ where }),
      this.models.category.findMany({ orderBy: { name: "asc" } }),
    ]);

    const q: Record<string, string> = {};
    if (search) q.search = search;
    if (sortBy !== "name") q.sortBy = sortBy;
    if (sortOrder !== "asc") q.sortOrder = sortOrder;
    if (filterStatus && filterStatus !== "ALL") q.filterStatus = filterStatus;
    if (filterCategory) q.filterCategory = filterCategory;
    if (perPage !== 10) q.perPage = String(perPage);

    const buildQueryString = () =>
      Object.keys(q).length ? "&" + new URLSearchParams(q).toString() : "";
    const buildSortUrl = (col: string) => {
      const next = sortBy === col && sortOrder === "asc" ? "desc" : "asc";
      return `/admin/products?${new URLSearchParams({ ...q, sortBy: col, sortOrder: next, page: "1" }).toString()}`;
    };

    this.render("admin/product.view/index", {
      products,
      categories,
      total,
      page,
      perPage,
      search,
      sortBy,
      sortOrder,
      filterStatus,
      filterCategory,
      activeMenu: "products",
      buildQueryString,
      buildSortUrl,
    });
  }

  async new() {
    const categories = await this.models.category.findMany({
      orderBy: { name: "asc" },
    });
    this.render("admin/product.view/new", {
      categories,
      activeMenu: "products",
    });
  }

  async create() {
    const body = this.req.body || {};
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const content = String(body.content || "").trim();
    const price = parseFloat(String(body.price || "0"));
    const stock = parseInt(String(body.stock || "0"), 10);
    const sku = String(body.sku || "").trim();
    const categoryId = String(body.categoryId || "").trim();
    let imgUrl = String(body.imgUrl || "").trim() || null;
    const status = String(body.status || "ACTIVE").trim();

    // Validation
    if (!name) {
      this.flash(FlashType.Errors, { msg: "Tên sản phẩm là bắt buộc." });
      return this.redirect("/admin/products/new");
    }
    if (!categoryId) {
      this.flash(FlashType.Errors, { msg: "Danh mục là bắt buộc." });
      return this.redirect("/admin/products/new");
    }
    if (!sku) {
      this.flash(FlashType.Errors, { msg: "SKU là bắt buộc." });
      return this.redirect("/admin/products/new");
    }
    if (!(price >= 0)) {
      this.flash(FlashType.Errors, { msg: "Giá phải lớn hơn hoặc bằng 0." });
      return this.redirect("/admin/products/new");
    }
    if (!(stock >= 0)) {
      this.flash(FlashType.Errors, {
        msg: "Số lượng phải lớn hơn hoặc bằng 0.",
      });
      return this.redirect("/admin/products/new");
    }

    try {
      // Check if SKU already exists
      const existingSku = await this.models.product.findUnique({
        where: { sku },
      });
      if (existingSku) {
        this.flash(FlashType.Errors, { msg: "SKU này đã tồn tại." });
        return this.redirect("/admin/products/new");
      }

      const file = (this.req as any).file;
      if (file) {
        const storageAdapter = getStorageAdapter();
        const uploadedUrl = await storageAdapter.upload(file);
        if (uploadedUrl) imgUrl = uploadedUrl;
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const product = await this.models.product.create({
        data: {
          name,
          slug,
          description: description || null,
          content: content || null,
          price,
          stock,
          sku,
          categoryId,
          imgUrl,
          status: status || "ACTIVE",
        },
      });

      this.flash(FlashType.Success, {
        msg: `Đã tạo sản phẩm "${product.name}".`,
      });
      this.redirect(`/admin/products/${product.id}`);
    } catch (error: any) {
      this.flash(FlashType.Errors, { msg: error.message });
      this.redirect("/admin/products/new");
    }
  }

  async show() {
    const product = await this.models.product.findUnique({
      where: { id: this.req.params.id },
      include: { category: true },
    });
    if (!product) return this.redirect("/admin/products");
    this.render("admin/product.view/show", {
      product,
      activeMenu: "products",
    });
  }

  async edit() {
    const [product, categories] = await Promise.all([
      this.models.product.findUnique({
        where: { id: this.req.params.id },
        include: { category: true },
      }),
      this.models.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    if (!product) return this.redirect("/admin/products");
    this.render("admin/product.view/edit", {
      product,
      categories,
      activeMenu: "products",
    });
  }

  async update() {
    const id = this.req.params.id;
    const existing = await this.models.product.findUnique({ where: { id } });
    if (!existing) return this.redirect("/admin/products");

    const body = this.req.body || {};
    const data: Prisma.ProductUpdateInput = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        this.flash(FlashType.Errors, { msg: "Tên sản phẩm là bắt buộc." });
        return this.redirect(`/admin/products/${id}/edit`);
      }
      data.name = name;

      // Auto-generate slug from name
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      data.slug = slug;
    }

    if (body.description !== undefined) {
      const desc = String(body.description).trim();
      data.description = desc || null;
    }

    if (body.content !== undefined) {
      const cnt = String(body.content).trim();
      data.content = cnt || null;
    }

    if (body.price !== undefined && body.price !== "") {
      const price = parseFloat(String(body.price));
      if (!(price >= 0)) {
        this.flash(FlashType.Errors, { msg: "Giá phải lớn hơn hoặc bằng 0." });
        return this.redirect(`/admin/products/${id}/edit`);
      }
      data.price = price;
    }

    if (body.stock !== undefined && body.stock !== "") {
      const stock = parseInt(String(body.stock), 10);
      if (!(stock >= 0)) {
        this.flash(FlashType.Errors, {
          msg: "Số lượng phải lớn hơn hoặc bằng 0.",
        });
        return this.redirect(`/admin/products/${id}/edit`);
      }
      data.stock = stock;
    }

    if (body.sku !== undefined) {
      const sku = String(body.sku).trim();
      if (!sku) {
        this.flash(FlashType.Errors, { msg: "SKU là bắt buộc." });
        return this.redirect(`/admin/products/${id}/edit`);
      }
      // Check if SKU already exists (excluding current product)
      if (sku !== existing.sku) {
        const existingSku = await this.models.product.findUnique({
          where: { sku },
        });
        if (existingSku) {
          this.flash(FlashType.Errors, { msg: "SKU này đã tồn tại." });
          return this.redirect(`/admin/products/${id}/edit`);
        }
      }
      data.sku = sku;
    }

    if (body.categoryId !== undefined) {
      const cid = String(body.categoryId).trim();
      if (!cid) {
        this.flash(FlashType.Errors, { msg: "Danh mục là bắt buộc." });
        return this.redirect(`/admin/products/${id}/edit`);
      }
      data.category = {
        connect: { id: cid },
      };
    }

    if (body.imgUrl !== undefined) {
      const url = String(body.imgUrl).trim();
      data.imgUrl = url || null;
    }

    if (body.status !== undefined) {
      const status = String(body.status).trim();
      if (["ACTIVE", "INACTIVE", "ARCHIVED"].includes(status)) {
        data.status = status;
      }
    }

    const file = (this.req as any).file;
    if (file) {
      const storageAdapter = getStorageAdapter();
      const uploadedUrl = await storageAdapter.upload(file);
      if (uploadedUrl) data.imgUrl = uploadedUrl;
    }

    await this.models.product.update({ where: { id }, data });

    this.flash(FlashType.Success, { msg: "Đã cập nhật sản phẩm." });
    this.redirect(`/admin/products/${id}`);
  }

  async destroy() {
    const id = this.req.params.id;
    const existing = await this.models.product.findUnique({ where: { id } });
    if (!existing) return this.redirect("/admin/products");

    await this.models.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    this.flash(FlashType.Success, {
      msg: `Đã vô hiệu hoá sản phẩm "${existing.name}".`,
    });
    this.redirect("/admin/products");
  }
}
