import { Prisma } from "@db";
import { FlashType } from "../../../configs/enum";
import { getStorageAdapter } from "../../../lib/utils/storage";
import { AdminController } from "./admin.controller";

export class AdminServiceController extends AdminController {
  async index() {
    const pickStr = (v: unknown): string => {
      if (Array.isArray(v)) v = v.find((x) => x != null && x !== "") ?? "";
      return v == null ? "" : String(v);
    };
    const ALLOWED_SORT = new Set([
      "name",
      "price",
      "durationMinutes",
      "isActive",
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

    const where: Prisma.ServiceWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (filterStatus === "ACTIVE") where.isActive = true;
    if (filterStatus === "INACTIVE") where.isActive = false;
    if (filterCategory) where.categoryId = filterCategory;

    const [services, total, categories] = await Promise.all([
      this.models.service.findMany({
        where,
        include: { category: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.models.service.count({ where }),
      this.models.category.findMany({ orderBy: { name: "asc" } }),
    ]);

    const q: Record<string, string> = {};
    if (search) q.search = search;
    if (sortBy !== "name") q.sortBy = sortBy;
    if (sortOrder !== "asc") q.sortOrder = sortOrder;
    if (filterStatus) q.filterStatus = filterStatus;
    if (filterCategory) q.filterCategory = filterCategory;
    if (perPage !== 10) q.perPage = String(perPage);

    const buildQueryString = () =>
      Object.keys(q).length ? "&" + new URLSearchParams(q).toString() : "";
    const buildSortUrl = (col: string) => {
      const next = sortBy === col && sortOrder === "asc" ? "desc" : "asc";
      return `/admin/services?${new URLSearchParams({ ...q, sortBy: col, sortOrder: next, page: "1" }).toString()}`;
    };

    this.render("admin/service.view/index", {
      services,
      categories,
      total,
      page,
      perPage,
      search,
      sortBy,
      sortOrder,
      filterStatus,
      filterCategory,
      activeMenu: "services",
      buildQueryString,
      buildSortUrl,
    });
  }

  async new() {
    const categories = await this.models.category.findMany({
      orderBy: { name: "asc" },
    });
    this.render("admin/service.view/new", {
      categories,
      activeMenu: "services",
    });
  }

  async create() {
    const body = this.req.body || {};
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const price = parseFloat(String(body.price || "0"));
    const durationMinutes = parseInt(String(body.durationMinutes || "0"), 10);
    const categoryId = String(body.categoryId || "").trim() || null;
    let imageUrl = String(body.imageUrl || "").trim() || null;
    const isActive = String(body.isActive || "true") === "true";
    const isFeatured = body.isFeatured === "on" || body.isFeatured === "true";

    if (!name) {
      this.flash(FlashType.Errors, { msg: "Tên dịch vụ là bắt buộc." });
      return this.redirect("/admin/services/new");
    }
    if (!(price >= 0)) {
      this.flash(FlashType.Errors, { msg: "Giá phải lớn hơn hoặc bằng 0." });
      return this.redirect("/admin/services/new");
    }
    if (!(durationMinutes >= 1)) {
      this.flash(FlashType.Errors, { msg: "Thời lượng phải lớn hơn 0 phút." });
      return this.redirect("/admin/services/new");
    }

    try {
      const file = (this.req as any).file;
      if (file) {
        const storageAdapter = getStorageAdapter();
        const uploadedUrl = await storageAdapter.upload(file);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const service = await this.models.service.create({
        data: {
          name,
          description: description || null,
          price,
          durationMinutes,
          categoryId,
          imageUrl,
          isActive,
          isFeatured,
        },
      });

      this.flash(FlashType.Success, {
        msg: `Đã tạo dịch vụ "${service.name}".`,
      });
      this.redirect(`/admin/services/${service.id}`);
    } catch (error: any) {
      this.flash(FlashType.Errors, { msg: error.message });
      this.redirect("/admin/services/new");
    }
  }

  async show() {
    const service = await this.models.service.findUnique({
      where: { id: this.req.params.id },
      include: { category: true },
    });
    if (!service) return this.redirect("/admin/services");
    this.render("admin/service.view/show", {
      service,
      activeMenu: "services",
    });
  }

  async edit() {
    const [service, categories] = await Promise.all([
      this.models.service.findUnique({
        where: { id: this.req.params.id },
        include: { category: true },
      }),
      this.models.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    if (!service) return this.redirect("/admin/services");
    this.render("admin/service.view/edit", {
      service,
      categories,
      activeMenu: "services",
    });
  }

  async update() {
    const id = this.req.params.id;
    const existing = await this.models.service.findUnique({ where: { id } });
    if (!existing) return this.redirect("/admin/services");

    const body = this.req.body || {};
    const data: Prisma.ServiceUpdateInput = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        this.flash(FlashType.Errors, { msg: "Tên dịch vụ là bắt buộc." });
        return this.redirect(`/admin/services/${id}/edit`);
      }
      data.name = name;
    }
    if (body.description !== undefined) {
      const desc = String(body.description).trim();
      data.description = desc || null;
    }
    if (body.price !== undefined && body.price !== "") {
      const price = parseFloat(String(body.price));
      if (!(price >= 0)) {
        this.flash(FlashType.Errors, { msg: "Giá phải lớn hơn hoặc bằng 0." });
        return this.redirect(`/admin/services/${id}/edit`);
      }
      data.price = price;
    }
    if (body.durationMinutes !== undefined && body.durationMinutes !== "") {
      const dur = parseInt(String(body.durationMinutes), 10);
      if (!(dur >= 1)) {
        this.flash(FlashType.Errors, {
          msg: "Thời lượng phải lớn hơn 0 phút.",
        });
        return this.redirect(`/admin/services/${id}/edit`);
      }
      data.durationMinutes = dur;
    }
    if (body.categoryId !== undefined) {
      const cid = String(body.categoryId).trim();
      data.category = cid
        ? { connect: { id: cid } }
        : { disconnect: true };
    }
    if (body.imageUrl !== undefined) {
      const url = String(body.imageUrl).trim();
      data.imageUrl = url || null;
    }
    if (body.isActive !== undefined) {
      data.isActive = String(body.isActive) === "true";
    }
    if (body.isFeatured !== undefined) {
      const raw = Array.isArray(body.isFeatured)
        ? body.isFeatured[body.isFeatured.length - 1]
        : body.isFeatured;
      data.isFeatured = String(raw) === "true" || String(raw) === "on";
    }

    const file = (this.req as any).file;
    if (file) {
      const storageAdapter = getStorageAdapter();
      const uploadedUrl = await storageAdapter.upload(file);
      if (uploadedUrl) data.imageUrl = uploadedUrl;
    }

    await this.models.service.update({ where: { id }, data });

    this.flash(FlashType.Success, { msg: "Đã cập nhật dịch vụ." });
    this.redirect(`/admin/services/${id}`);
  }

  async destroy() {
    const id = this.req.params.id;
    const existing = await this.models.service.findUnique({ where: { id } });
    if (!existing) return this.redirect("/admin/services");

    await this.models.service.update({
      where: { id },
      data: { isActive: false },
    });
    this.flash(FlashType.Success, {
      msg: `Đã vô hiệu hoá dịch vụ "${existing.name}".`,
    });
    this.redirect("/admin/services");
  }
}
