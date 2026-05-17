// import { PasswordType, UserStatus } from "@configs/db/enums";
// import { Prisma } from "@db";
// import models from "@models";
// import { LoginValidator } from "@validators/auth.validator";
// import { Security } from "ts-rails";
// import { ApiController } from "./api.controller";

// export class ApiAuthController extends ApiController {
//   async create() {
//     try {
//       const { email, password } =
//         await this.params(LoginValidator).permit(
//           "email",
//           "password",
//         );

//       const normalizedEmail = email.trim().toLowerCase();

//       const user = await models.user.findFirst({
//         where: {
//           email: normalizedEmail,
//           status: UserStatus.ACTIVE,
//           deleted: false,
//         },
//         include: {
//           passwords: {
//             where: {
//               deleted: false,
//               type: PasswordType.PASSWORD,
//             },
//             orderBy: {
//               createdAt: Prisma.SortOrder.desc,
//             },
//             take: 1,
//           },
//         },
//       });

//       // User không tồn tại
//       if (!user) {
//         return this.res.status(401).json({
//           success: false,
//           message: "Email hoặc mật khẩu không đúng.",
//         });
//       }

//       // Không có password
//       if (user.passwords.length === 0) {
//         return this.res.status(401).json({
//           success: false,
//           message: "Tài khoản chưa thiết lập mật khẩu.",
//         });
//       }

//       // Verify password
//       const isValidPassword =
//         await Security.verifyPassword(
//           password,
//           user.passwords[0].password,
//         );

//       if (!isValidPassword) {
//         return this.res.status(401).json({
//           success: false,
//           message: "Email hoặc mật khẩu không đúng.",
//         });
//       }

//       /**
//        * SESSION LOGIN
//        * Chỉ set session nếu middleware đã bật
//        */
//       if (this.req.session) {
//         this.req.session.userId = user.id;

//         await new Promise<void>((resolve, reject) => {
//           this.req.session!.save((err) => {
//             if (err) {
//               reject(err);
//               return;
//             }

//             resolve();
//           });
//         });
//       }

//       return this.res.status(200).json({
//         success: true,
//         message: "Đăng nhập thành công.",
//         data: {
//           id: user.id,
//           email: user.email,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           middleName: user.middleName,
//           avatarUrl: user.avatarUrl,
//         },
//       });
//     } catch (error: any) {
//       console.error("API Login Error:", error);

//       return this.res.status(500).json({
//         success: false,
//         message:
//           error?.message ||
//           "Đã xảy ra lỗi khi đăng nhập.",
//       });
//     }
//   }
// }

import {
  PasswordType,
  UserStatus,
} from "@configs/db/enums";
import { Prisma } from "@db";
import { generateToken } from "@lib";
import models from "@models";
import { LoginValidator } from "@validators/auth.validator";
import { Security } from "ts-rails";
import { ApiController } from "./api.controller";

export class ApiAuthController extends ApiController {
  async create() {
    try {
      /**
       * Validate input
       */
      const { email, password } =
        await this.params(LoginValidator).permit(
          "email",
          "password",
        );

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      /**
       * Find user
       */
      const user = await models.user.findFirst({
        where: {
          email: normalizedEmail,
          deleted: false,
        },
        include: {
          passwords: {
            where: {
              deleted: false,
              type: PasswordType.PASSWORD,
            },
            orderBy: {
              createdAt:
                Prisma.SortOrder.desc,
            },
            take: 1,
          },
        },
      });

      /**
       * User not found
       */
      if (!user) {
        return this.res.status(401).json({
          success: false,
          message:
            "Email hoặc mật khẩu không đúng.",
        });
      }

      /**
       * User deleted
       */
      if (user.deleted) {
        return this.res.status(403).json({
          success: false,
          message:
            "Tài khoản đã bị xóa.",
        });
      }

      /**
       * User inactive
       */
      if (
        user.status ===
        UserStatus.INACTIVE
      ) {
        return this.res.status(403).json({
          success: false,
          message:
            "Tài khoản đã bị khóa.",
        });
      }

      /**
       * Pending approval
       */
      if (
        user.status ===
        UserStatus.PENDING
      ) {
        return this.res.status(403).json({
          success: false,
          message:
            "Tài khoản đang chờ xét duyệt.",
        });
      }

      /**
       * Password not setup
       */
      if (user.passwords.length === 0) {
        return this.res.status(401).json({
          success: false,
          message:
            "Tài khoản chưa thiết lập mật khẩu.",
        });
      }

      /**
       * Verify password
       */
      const isValidPassword =
        await Security.verifyPassword(
          password,
          user.passwords[0].password,
        );

      if (!isValidPassword) {
        return this.res.status(401).json({
          success: false,
          message:
            "Email hoặc mật khẩu không đúng.",
        });
      }

      /**
       * Generate JWT Token
       */
      const accessToken =
        generateToken(
          {
            id: user.id,
            email: user.email,
          },
          "7d",
        );

      /**
       * Optional refresh token
       */
      const refreshToken =
        generateToken(
          {
            id: user.id,
          },
          "30d",
        );

      /**
       * Save session (optional)
       */
      if (this.req.session) {
        this.req.session.userId =
          user.id;

        await new Promise<void>(
          (resolve, reject) => {
            this.req.session!.save(
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                resolve();
              },
            );
          },
        );
      }

      /**
       * Response
       */
      return this.res.status(200).json({
        success: true,
        message:
          "Đăng nhập thành công.",

        accessToken,
        refreshToken,

        data: {
          id: user.id,
          email: user.email,
          firstName:
            user.firstName,
          middleName:
            user.middleName,
          lastName:
            user.lastName,
          avatarUrl:
            user.avatarUrl,
          status: user.status,
        },
      });
    } catch (error: any) {
      console.error(
        "API Login Error:",
        error,
      );

      return this.res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Đã xảy ra lỗi khi đăng nhập.",
      });
    }
  }

  async destroy() {
    try {
        if (this.req.session) {
            await new Promise<void>(
                (resolve, reject) => {
                    this.req.session.destroy(
                        (err) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve();
                        }
                    );
                }
            );
        }

        return this.res
            .status(200)
            .json({
                success: true,
                message:
                    "Đăng xuất thành công.",
            });
    } catch (error: any) {
        return this.res
            .status(500)
            .json({
                success: false,
                message:
                    error.message ||
                    "Logout failed.",
            });
    }
}
}