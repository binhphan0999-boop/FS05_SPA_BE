import { UserService } from "@services/user/user.service";
import { ApiV1Controller } from "../apiV1.controller";

export class UserController extends ApiV1Controller {
  async profile() {
    try {
      const userId = (this.req as any).currentUser?.id;

      if (!userId) {
        return this.res.status(401).json({
          success: false,
          message: "You have to login first.",
        });
      }

      const user = await new UserService().getProfile(userId);

      return this.renderJson({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return this.res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
