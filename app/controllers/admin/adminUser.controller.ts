import { PasswordType } from "@configs/db/enums/user";
import { FlashType } from "@configs/enum";
import { Prisma } from "@db";
import models from "@models";
import {
  CreateUserValidator,
  UpdateUserValidator,
} from "@validators/admin.validator";
import bcrypt from "bcrypt";
import { NotFoundError } from "ts-rails";
import { AdminController } from "./admin.controller";

export class AdminUserController extends AdminController {
  async index() {
  console.log("ADMIN USER CONTROLLER LOADED", true);

    const search = String(this.req.query.search || "").trim();
    const sortBy = String(this.req.query.sortBy || "createdAt");
    const sortOrder = String(this.req.query.sortOrder || "desc") as
      | "asc"
      | "desc";
    const filterStatus = String(this.req.query.filterStatus || "");
    const page = Math.max(1, parseInt(String(this.req.query.page || "1"), 10));
    const perPage = Math.min(
      50,
      Math.max(10, parseInt(String(this.req.query.perPage || "10"), 10)),
    );

    const where: Prisma.UserWhereInput = { deleted: false };
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }
    if (filterStatus) where.status = filterStatus;

    const [users, total] = await Promise.all([
      models.user.findMany({
        where,
        include: { roles: { include: { role: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      models.user.count({ where }),
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
      return `/admin/users?${new URLSearchParams({ ...q, sortBy: col, sortOrder: next, page: "1" }).toString()}`;
    };

    const roles = await models.role.findMany({ where: { deleted: false } });

    this.render("admin/user.view/index", {
      users,
      roles,
      total,
      page,
      perPage,
      search,
      sortBy,
      sortOrder,
      filterStatus,
      buildQueryString,
      buildSortUrl,
    });
  }

  async show() {
    const targetUser = await this.getUserWithPermissions(this.req.params.id);
    if (!targetUser) throw new NotFoundError("User not found");

    const [roles, features] = await Promise.all([
      models.role.findMany({ where: { deleted: false } }),
      models.feature.findMany({
        where: { deleted: false },
        include: {
          permissions: { where: { deleted: false } },
        },
      }),
    ]);

    this.render("admin/user.view/show", {
      user: this.req.user,
      targetUser,
      roles,
      features,
    });
  }

  async new() {
    const roles = await models.role.findMany({ where: { deleted: false } });
    this.render("admin/user.view/new", {
      user: this.req.user,
      roles,
    });
  }

  async create() {
    const data = await this.params(CreateUserValidator).permit(
      "firstName",
      "lastName",
      "email",
      "password",
      "roleIds",
    );
    const { firstName, lastName, email, password, roleIds } = data;
    const roleIdsArr = roleIds ?? [];
    const plainPassword = password || "Abcd@1234"; // Mật khẩu mặc định nếu không nhập
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log("Creating user with data:", { firstName, lastName, email, roleIds: roleIdsArr });

    const user = await models.user.create({
      data: {
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || "",
        status: "ACTIVE",
        roles: {
          create: roleIdsArr.map((roleId: string) => ({
            role: { connect: { id: roleId } },
          })),
        },
        passwords: {
          create: {
            password: hashedPassword,
            type: PasswordType.PASSWORD,
          },
        },
      },
    });

    this.flash(FlashType.Success, {
      msg: this.t("flash.user_created", { email: user.email }),
    });
    this.redirect("/admin/users");
  }

  async edit() {
    console.log("chạy vào đây:", true);
    const targetUser = await this.getUserWithPermissions(this.req.params.id);
    if (!targetUser) throw new NotFoundError("User not found");

    const [roles, features] = await Promise.all([
      models.role.findMany({ where: { deleted: false } }),
      models.feature.findMany({
        where: { deleted: false },
        include: {
          permissions: { where: { deleted: false } },
        },
      }),
    ]);

    this.render("admin/user.view/edit", {
      user: this.req.user,
      targetUser,
      roles,
      features,
    });
  }

  async update() {
    console.log("chạy vào đây:", true);
    const id = this.req.params.id;
    const allPermittedFields = [
      "section",
      "firstName",
      "lastName",
      "email",
      "status",
      "phoneNumber",
      "address",
      "roleIds",
      "permissionIds",
    ];

    // Only permit fields that are actually present in the request body
    const fieldsToPermit = allPermittedFields.filter(field => Object.prototype.hasOwnProperty.call(this.req.body, field));

    console.log("BODY:", this.req.body);
    console.log("FIELDS:", fieldsToPermit);

    const data = await this.params(UpdateUserValidator).permit(
      ...fieldsToPermit,
    );
    console.log("data-data: ", data);
    const {
      section,
      firstName,
      lastName,
      email,
      status,
      phoneNumber,
      address,
      roleIds,
      permissionIds,
    } = data;


    if (!section || section === "personal") {
      const personalData: Prisma.UserUpdateInput = {};
      // Chỉ gán nếu giá trị khác undefined (đã được xử lý bởi Transform ở validator)
      if (firstName !== undefined) personalData.firstName = firstName ?? "";
      if (lastName !== undefined) personalData.lastName = lastName ?? "";
      if (email !== undefined) personalData.email = email;
      if (status !== undefined) personalData.status = status;
      if (phoneNumber !== undefined) personalData.phoneNumber = phoneNumber ?? "";
      if (address !== undefined) personalData.address = address ?? "";
      
      if (Object.keys(personalData).length) {
        await models.user.update({ where: { id }, data: personalData });
      }
    }

    // Chỉ cập nhật roles nếu có gửi roleIds hoặc thuộc đúng section
    if (section === "roles" || (!section && roleIds !== undefined)) {
      const roleIdsArr = Array.isArray(roleIds) ? roleIds : [];
      // Sử dụng transaction để đảm bảo tính nguyên tử
      await models.$transaction([
        models.userToRole.deleteMany({ where: { userId: id } }),
        models.userToRole.createMany({
          data: roleIdsArr.map(roleId => ({ userId: id, roleId }))
        })
      ]);
    }

    // Chỉ cập nhật permissions nếu có gửi permissionIds hoặc thuộc đúng section
    if (section === "permissions" || (!section && permissionIds !== undefined)) {
      const permissionIdsArr = Array.isArray(permissionIds) ? permissionIds : [];
      await models.$transaction([
        models.userToPermission.deleteMany({ where: { userId: id } }),
        models.userToPermission.createMany({
          data: permissionIdsArr.map(permissionId => ({ userId: id, permissionId }))
        })
      ]);
    }

    this.flash(FlashType.Success, { msg: this.t("flash.user_updated") });
    this.redirect(`/admin/users/${id}`);
  }

  async destroy() {
    const id = this.req.params.id;
    await models.user.update({
      where: { id },
      data: { deleted: true },
    });
    this.flash(FlashType.Success, {
      msg: this.t("flash.user_deleted_success"),
    });
    this.redirect("/admin/users");
  }

  private async getUserWithPermissions(userId: string) {
    const user = await models.user.findFirst({
      where: { id: userId, deleted: false },
      include: {
        roles: { include: { role: true } },
        permissions: {
          include: {
            permission: {
              include: { feature: true },
            },
          },
        },
      },
    });
    return user;
  }
}
