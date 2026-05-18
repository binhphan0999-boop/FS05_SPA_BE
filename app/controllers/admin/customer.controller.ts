import {
  CreateCustomerValidator,
  UpdateCustomerValidator,
} from "../../../app/validators/admin.validator";
import { FlashType } from "../../../configs/enum";
import { getStorageAdapter } from "../../../lib/utils/storage";
import { ApplicationController } from "../application.controller";

export class AdminCustomerController extends ApplicationController {
  /**
   * GET /admin/customers/new
   */
  async new() {
    this.render("admin/customer.view/new", {
      activeMenu: "customers",
    });
  }

  /**
   * GET /admin/customers
   */
  async index() {
    const page = Number(this.req.query.page || 1);
    const perPage = Number(this.req.query.perPage || 10);
    const search = String(this.req.query.search || "");
    const sortBy = String(this.req.query.sortBy || "createdAt");
    const sortOrder = (this.req.query.sortOrder === "asc" ? "asc" : "desc") as
      | "asc"
      | "desc";
    const filterStatus = String(this.req.query.filterStatus || "");

    const query: any = {
      where: {
        deleted: false,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (Number(page) - 1) * Number(perPage),
      take: Number(perPage),
    };

    if (search) {
      query.where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (filterStatus) {
      query.where.status = filterStatus;
    }

    const [customers, total] = await Promise.all([
      this.models.customer.findMany(query),
      this.models.customer.count({ where: query.where }),
    ]);

    const q: Record<string, string> = {};
    if (search) q.search = search;
    if (sortBy !== "createdAt") q.sortBy = sortBy;
    if (sortOrder !== "desc") q.sortOrder = sortOrder;
    if (filterStatus) q.filterStatus = filterStatus;
    if (perPage !== 10) q.perPage = String(perPage);

    const buildQueryString = () =>
      Object.keys(q).length ? "&" + new URLSearchParams(q).toString() : "";

    const buildSortUrl = (col: string) => {
      const next = sortBy === col && sortOrder === "asc" ? "desc" : "asc";
      return `/admin/customers?${new URLSearchParams({ ...q, sortBy: col, sortOrder: next, page: "1" }).toString()}`;
    };

    this.render("admin/customer.view/index", {
      customers,
      total,
      page: Number(page),
      perPage: Number(perPage),
      search,
      sortBy,
      sortOrder,
      filterStatus,
      activeMenu: "customers",
      buildSortUrl: (col: string) => buildSortUrl(col),
      buildQueryString: () => buildQueryString(),
    });
  }

  /**
   * POST /admin/customers
   */
  async create() {
    const data = await this.params(CreateCustomerValidator).permit(
      "firstName",
      "lastName",
      "middleName",
      "email",
      "phoneNumber",
      "gender",
      "address",
      "birthday",
      "status",
      "avatarUrl",
    );
    let {
      firstName,
      lastName,
      middleName,
      email,
      phoneNumber,
      gender,
      address,
      birthday,
      status,
      avatarUrl,
    } = data;

    try {
      const file = (this.req as any).file;
      if (file) {
        const storageAdapter = getStorageAdapter();
        const uploadedUrl = await storageAdapter.upload(file);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      if (email) {
        const existing = await this.models.customer.findUnique({
          where: { email },
        });
        if (existing) {
          this.flash(FlashType.Errors, {
            msg: "Email này đã tồn tại trong hệ thống.",
          });
          return this.redirect("/admin/customers");
        }
      }

      await this.models.customer.create({
        data: {
          firstName,
          lastName,
          middleName,
          email,
          phoneNumber,
          gender,
          address,
          birthday: birthday ? new Date(birthday) : null,
          avatarUrl,
          status: status || "ACTIVE",
        },
      });

      this.flash(FlashType.Success, { msg: this.t("flash.created") });
      this.redirect("/admin/customers");
    } catch (error: any) {
      this.flash(FlashType.Errors, { msg: error.message });
      this.redirect("/admin/customers");
    }
  }

  async show() {
    const customer = await this.models.customer.findUnique({
      where: { id: this.req.params.id },
    });
    if (!customer) return this.redirect("/admin/customers");
    this.render("admin/customer.view/show", {
      customer,
      activeMenu: "customers",
    });
  }

  async edit() {
    const customer = await this.models.customer.findUnique({
      where: { id: this.req.params.id },
    });
    if (!customer) return this.redirect("/admin/customers");
    this.render("admin/customer.view/edit", {
      customer,
      activeMenu: "customers",
    });
  }

  async update() {
    const data = await this.params(UpdateCustomerValidator).permit(
      "firstName",
      "lastName",
      "middleName",
      "email",
      "phoneNumber",
      "gender",
      "address",
      "birthday",
      "status",
      "avatarUrl",
    );
    let {
      firstName,
      lastName,
      middleName,
      email,
      phoneNumber,
      gender,
      address,
      birthday,
      status,
      avatarUrl,
    } = data;

    const file = (this.req as any).file;
    if (file) {
      const storageAdapter = getStorageAdapter();
      const uploadedUrl = await storageAdapter.upload(file);
      if (uploadedUrl) {
        avatarUrl = uploadedUrl;
      }
    }

    await this.models.customer.update({
      where: { id: this.req.params.id },
      data: {
        firstName,
        lastName,
        middleName,
        email,
        phoneNumber,
        gender,
        address,
        birthday: birthday ? new Date(birthday) : undefined,
        status,
        avatarUrl,
      },
    });
    this.flash(FlashType.Success, { msg: this.t("flash.updated") });
    this.redirect(`/admin/customers/${this.req.params.id}`);
  }

  async destroy() {
    await this.models.customer.update({
      where: { id: this.req.params.id },
      data: { deleted: true },
    });
    this.flash(FlashType.Success, {
      msg: this.t("flash.user_deleted_success"),
    });
    this.redirect("/admin/customers");
  }
}
