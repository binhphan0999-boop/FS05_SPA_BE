import { Security } from "ts-rails";
import {
  CreateStaffValidator,
  UpdateStaffValidator,
} from "../../../app/validators/admin.validator";
import { PasswordType } from "../../../configs/db/enums";
import { FlashType } from "../../../configs/enum";
import { getStorageAdapter } from "../../../lib/utils/storage";
import { ApplicationController } from "../application.controller";

export class AdminStaffController extends ApplicationController {
  /**
   * GET /admin/staff/new
   */
  async new() {
    this.render("admin/staff.view/new", {
      activeMenu: "staff",
    });
  }

  /**
   * GET /admin/staff
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
        roles: {
          some: {
            role: {
              code: "STAFF", // Lọc những người dùng có vai trò là nhân viên
            },
          },
        },
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

    const [staffs, total] = await Promise.all([
      this.models.user.findMany(query),
      this.models.user.count({ where: query.where }),
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
      return `/admin/staff?${new URLSearchParams({ ...q, sortBy: col, sortOrder: next, page: "1" }).toString()}`;
    };

    this.render("admin/staff.view/index", {
      staffs,
      total,
      page: Number(page),
      perPage: Number(perPage),
      search,
      sortBy,
      sortOrder,
      filterStatus,
      activeMenu: "staff",
      buildSortUrl: (col: string) => buildSortUrl(col),
      buildQueryString: () => buildQueryString(),
    });
  }

  /**
   * POST /admin/staff
   */
  async create() {
    const data = await this.params(CreateStaffValidator).permit(
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "status",
      "avatarUrl",
    );
    let { firstName, lastName, email, phoneNumber, status, avatarUrl } = data;

    try {
      // Xử lý upload ảnh nếu có file được gửi lên từ multer
      const file = (this.req as any).file;
      if (file) {
        const storageAdapter = getStorageAdapter();
        const uploadedUrl = await storageAdapter.upload(file);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const existingUser = await this.models.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        this.flash(FlashType.Errors, {
          msg: "Email này đã tồn tại trong hệ thống.",
        });
        return this.redirect("/admin/staff");
      }

      await this.models.user.create({
        data: {
          firstName,
          lastName,
          email,
          phoneNumber,
          avatarUrl,
          status: status || "ACTIVE",
          roles: {
            create: [
              {
                role: {
                  connectOrCreate: {
                    where: { code: "STAFF" },
                    create: { code: "STAFF", name: "Staff" },
                  },
                },
              },
            ],
          },
          passwords: {
            create: {
              password: await Security.hashPassword("123456"),
              type: PasswordType.PASSWORD,
            },
          },
        },
      });

      this.flash(FlashType.Success, { msg: this.t("flash.created") });
      this.redirect("/admin/staff");
    } catch (error: any) {
      this.flash(FlashType.Errors, { msg: error.message });
      this.redirect("/admin/staff");
    }
  }

  async show() {
    const staff = await this.models.user.findUnique({
      where: { id: this.req.params.id },
    });
    if (!staff) return this.redirect("/admin/staff");
    this.render("admin/staff.view/show", { staff, activeMenu: "staff" });
  }

  async edit() {
    const staff = await this.models.user.findUnique({
      where: { id: this.req.params.id },
    });
    if (!staff) return this.redirect("/admin/staff");
    this.render("admin/staff.view/edit", { staff, activeMenu: "staff" });
  }

  async update() {
    const data = await this.params(UpdateStaffValidator).permit(
      "firstName",
      "lastName",
      "phoneNumber",
      "status",
      "avatarUrl",
    );
    let { firstName, lastName, phoneNumber, status, avatarUrl } = data;

    // Xử lý upload ảnh khi update
    const file = (this.req as any).file;
    if (file) {
      const storageAdapter = getStorageAdapter();
      const uploadedUrl = await storageAdapter.upload(file);
      if (uploadedUrl) {
        avatarUrl = uploadedUrl;
      }
    }

    await this.models.user.update({
      where: { id: this.req.params.id },
      data: {
        firstName,
        lastName,
        phoneNumber,
        status,
        avatarUrl,
      },
    });
    this.flash(FlashType.Success, { msg: this.t("flash.updated") });
    this.redirect(`/admin/staff/${this.req.params.id}`);
  }

  async destroy() {
    await this.models.user.update({
      where: { id: this.req.params.id },
      data: { deleted: true },
    });
    this.flash(FlashType.Success, {
      msg: this.t("flash.user_deleted_success"),
    });
    this.redirect("/admin/staff");
  }
}
