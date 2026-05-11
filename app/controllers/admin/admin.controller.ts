import { ApplicationController } from "..";
import { FlashType } from "../../../configs/enum";

export class AdminController extends ApplicationController {
  async index() {
    if (!this.currentUser) {
      this.flash(FlashType.Errors, { msg: this.t("flash.unauthorized") });
      return this.redirect("/login");
    }
    if (!this.currentUser.permissions?.some(p => p.startsWith("AM::") || p.startsWith("UM::") || p.startsWith("APPOINTMENT::"))) {
      this.flash(FlashType.Errors, { msg: this.t("flash.forbidden") });
      return this.redirect("/");
    }
    if (this.currentUser.permissions.some(p => p.startsWith("AM::") || p.startsWith("UM::"))) {
      return this.redirect("/admin/users");
    }
    if (this.currentUser.permissions.some(p => p.startsWith("APPOINTMENT::"))) {
      return this.redirect("/admin/appointments");
    }
    this.redirect("/");
  }
}
