import { ApplicationController } from "..";
import { FlashType } from "../../../configs/enum";

export class AdminController extends ApplicationController {
  async index() {
    if (!this.currentUser) {
      this.flash(FlashType.Errors, { msg: this.t("flash.unauthorized") });
      return this.redirect("/login");
    }
    if (
      !this.currentUser.permissions?.some(
        (p) =>
          p.startsWith("AM::") ||
          p.startsWith("UM::") ||
          p.startsWith("APPOINTMENT::") ||
          p.startsWith("STAFF::") ||
          p.startsWith("PRODUCT::") ||
          p.startsWith("NEWS::"),
      )
    ) {
      this.flash(FlashType.Errors, { msg: this.t("flash.forbidden") });
      return this.redirect("/");
    }
    if (this.currentUser.permissions.some((p) => p.startsWith("STAFF::"))) {
      return this.redirect("/admin/staff");
    }
    if (
      this.currentUser.permissions.some(
        (p) => p.startsWith("AM::") || p.startsWith("UM::"),
      )
    ) {
      return this.redirect("/admin/users");
    }
    if (
      this.currentUser.permissions.some((p) => p.startsWith("APPOINTMENT::"))
    ) {
      return this.redirect("/admin/appointments");
    }
    if (this.currentUser.permissions.some((p) => p.startsWith("PRODUCT::"))) {
      return this.redirect("/admin/products");
    }
    if (this.currentUser.permissions.some((p) => p.startsWith("NEWS::"))) {
      return this.redirect("/admin/news");
    }
    this.redirect("/");
  }
}
