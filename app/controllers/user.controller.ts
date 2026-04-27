import { FlashType } from "@configs/enum";
import { UserMailer } from "@mailers/user.mailer";
import models from "@models";
import { ApplicationController } from ".";

export class UserController extends ApplicationController {
  async index() {
    this.render("user.view/index", { user: this.currentUser });
  }

  async new() {
    this.render("user.view/new", { user: this.currentUser });
  }

  // async create() {
  //   const user = await models.user.create({
  //     data: this.params as any,
  //   });

  //   try {
  //     await UserMailer.createdUser(
  //       user.email,
  //       user.firstName,
  //       user.lastName,
  //       user.middleName ?? undefined,
  //     );
  //   } catch {
  //     this.flash(FlashType.Errors, { msg: "Google token has been expired." });
  //     return this.redirect("/users");
  //   }

  //   this.flash(FlashType.Success, {
  //     msg: `Created user ${user.firstName}${
  //       user.middleName ? ` ${user.middleName}` : ""
  //     } ${user.lastName}`,
  //   });
  //   this.redirect("/users");
  // }

  async create() {
  const { email, firstName, lastName, middleName, passwords } = this.req.body;
  console.log("Received user data:", { email, firstName, lastName, middleName });

  const user = await models.user.create({
    data: {
      email,
      firstName,
      lastName,
      middleName: middleName || null,
      passwords,
    },
  });

  try {
    await UserMailer.createdUser(
      user.email,
      user.firstName,
      user.lastName,
      user.middleName ?? undefined,
    );
  } catch {
    this.flash(FlashType.Errors, { msg: "Google token has been expired." });
    return this.redirect("/users");
  }

  this.flash(FlashType.Success, {
    msg: `Created user ${user.firstName}${
      user.middleName ? ` ${user.middleName}` : ""
    } ${user.lastName}`,
  });

  this.redirect("/users");
}
}
