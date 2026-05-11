import { PasswordType } from "@configs/db/enums/user";
import { FlashType } from "@configs/enum";
import { UserMailer } from "@mailers/user.mailer";
import models from "@models";
import { CreateUserValidator } from "@validators/admin.validator";
import bcrypt from "bcrypt";
import { BeforeAction } from "ts-rails";
import { ApplicationController } from "./application.controller";

@BeforeAction("requireLogin", { except: ["new", "create"] })
export class UserController extends ApplicationController {
  async index() {
    this.render("user.view/index", { user: this.currentUser });
  }

  async new() {
    this.render("user.view/new", { user: this.currentUser });
  }

  async create() {
    // 1. Lấy dữ liệu an toàn từ params thông qua Validator
    const data = await this.params(CreateUserValidator).permit(
      "email",
      "firstName",
      "lastName",
      "middleName",
      "password",
      "avatarUrl",
    );

    const { email, firstName, lastName, middleName, password, avatarUrl } = data;
    const plainPassword = password || "Abcd@1234"; 

    let createdUser;
    try {
      console.log("DEBUG: Creating user with data:", { email, firstName, lastName, middleName, avatarUrl });
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // 2. Sử dụng Nested Create để tạo User và Password trong 1 transaction duy nhất
      createdUser = await models.user.create({
        data: {
          email: email || "",
          firstName: firstName || "",
          lastName: lastName || "",
          middleName: middleName || null,
          avatarUrl: avatarUrl || null,
          status: "ACTIVE",
          passwords: {
            create: {
              password: hashedPassword,
              type: PasswordType.PASSWORD,
            },
          },
        },
      });

      // 3. Gửi email thông báo (không chặn quá trình redirect nếu lỗi mail)
      UserMailer.createdUser(
        createdUser.email,
        createdUser.firstName,
        createdUser.lastName,
        createdUser.middleName ?? undefined,
      ).catch(err => console.error("Mailer Error:", err));

      this.flash(FlashType.Success, {
        msg: this.t("flash.user_created", { email: createdUser.email }),
      });

      this.redirect("/auth");
    } catch (error) {
      console.error("Create User Error:", error);
      this.flash(FlashType.Errors, { msg: "Could not create user. Email might already exist." });
      return this.redirect("/users/new");
    }
  }
}
