// import {
//   PasswordType,
//   UserRole,
// } from "@configs/db/enums/user";

// import {
//   UserMailer,
// } from "@mailers/user.mailer";

// import models from "@models";

// import {
//   CreateUserValidator,
// } from "@validators/admin.validator";

// import bcrypt from "bcrypt";

// import {
//   ApiController,
// } from "./api.controller";

// export class UserController
//   extends ApiController {

//   async create() {
//     try {
//       /**
//        * Validate input
//        */
//       const data =
//         await this.params(
//           CreateUserValidator
//         ).permit(
//           "email",
//           "firstName",
//           "lastName",
//           "middleName",
//           "password",
//           "avatarUrl"
//         );

//       const {
//         email,
//         firstName,
//         lastName,
//         middleName,
//         password,
//         avatarUrl,
//       } = data;

//       /**
//        * Normalize email
//        */
//       const normalizedEmail =
//         email
//           .trim()
//           .toLowerCase();

//       /**
//        * Default password
//        */
//       const plainPassword =
//         password ||
//         "Abcd@1234";

//       /**
//        * Hash password
//        */
//       const hashedPassword =
//         await bcrypt.hash(
//           plainPassword,
//           10
//         );

//       /**
//        * Create user
//        */
//       const createdUser =
//         await models.user.create({
//           data: {
//             email:
//               normalizedEmail,

//             firstName:
//               firstName || "",

//             lastName:
//               lastName || "",

//             middleName:
//               middleName ||
//               null,

//             avatarUrl:
//               avatarUrl ||
//               null,

//             status:
//               "ACTIVE",

//             /**
//              * Default role
//              */
//             userRole:
//               UserRole.CUSTOMER,

//             passwords: {
//               create: {
//                 password:
//                   hashedPassword,

//                 type:
//                   PasswordType.PASSWORD,
//               },
//             },
//           },

//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             middleName: true,
//             avatarUrl: true,
//             userRole: true,
//             status: true,
//             createdAt: true,
//           },
//         });

//       /**
//        * Send welcome email
//        */
//       UserMailer.createdUser(
//         createdUser.email,
//         createdUser.firstName,
//         createdUser.lastName,
//         createdUser.middleName ??
//           undefined
//       ).catch((err) =>
//         console.error(
//           "Mailer Error:",
//           err
//         )
//       );

//       return this.res
//         .status(201)
//         .json({
//           success: true,
//           message:
//             "Tạo tài khoản thành công.",

//           data:
//             createdUser,
//         });

//     } catch (error: any) {
//       console.error(
//         "Create User API Error:",
//         error
//       );

//       return this.res
//         .status(400)
//         .json({
//           success: false,

//           message:
//             error?.code ===
//             "P2002"
//               ? "Email đã tồn tại."
//               : "Không thể tạo tài khoản.",
//         });
//     }
//   }
// }


import {
  PasswordType,
  UserStatus,
} from "@configs/db/enums/user";

import { UserMailer } from "@mailers/user.mailer";

import models from "@models";

import {
  CreateUserValidator,
} from "@validators/admin.validator";

import bcrypt from "bcrypt";

import { ApiController } from "./api.controller";

const DEFAULT_ROLE =
  "CUSTOMER";

export class UserController
  extends ApiController {

  async create() {
    try {
      const data =
        await this.params(
          CreateUserValidator
        ).permit(
          "email",
          "firstName",
          "lastName",
          "middleName",
          "password",
          "avatarUrl"
        );

      const {
        email,
        firstName,
        lastName,
        middleName,
        password,
        avatarUrl,
      } = data;

      const normalizedEmail =
        email.trim().toLowerCase();

      const plainPassword =
        password ||
        "Abcd@1234";

      const hashedPassword =
        await bcrypt.hash(
          plainPassword,
          10
        );

      /**
       * Find CUSTOMER role
       */
      const customerRole =
        await models.role.findFirst({
          where: {
            code:
              DEFAULT_ROLE,
            deleted:
              false,
          },

          select: {
            id: true,
          },
        });

      if (!customerRole) {
        return this.res
          .status(400)
          .json({
            success: false,
            message:
              "Role CUSTOMER không tồn tại.",
          });
      }

      /**
       * Create user
       */
      const createdUser =
        await models.user.create({
          data: {
            email:
              normalizedEmail,

            firstName:
              firstName || "",

            lastName:
              lastName || "",

            middleName:
              middleName ||
              null,

            avatarUrl:
              avatarUrl ||
              null,

            status:
              UserStatus.ACTIVE,

            deleted:
              false,

            passwords: {
              create: {
                password:
                  hashedPassword,

                type:
                  PasswordType.PASSWORD,
              },
            },
          },

          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        });

      /**
       * Insert user_to_role
       */
      await models.userToRole.create({
        data: {
          userId:
            createdUser.id,

          roleId:
            customerRole.id,
        },
      });

      /**
       * Send mail
       */
      UserMailer.createdUser(
        createdUser.email,
        createdUser.firstName,
        createdUser.lastName,
        createdUser.middleName ??
          undefined
      ).catch((err) =>
        console.error(
          "Mailer Error:",
          err
        )
      );

      return this.res
        .status(201)
        .json({
          success: true,
          message:
            "Tạo tài khoản thành công.",

          data:
            createdUser,
        });

    } catch (error: any) {
      console.error(
        "Create User API Error:",
        error
      );

      return this.res
        .status(400)
        .json({
          success: false,
          message:
            error?.code ===
            "P2002"
              ? "Email đã tồn tại."
              : "Không thể tạo tài khoản.",
        });
    }
  }
}