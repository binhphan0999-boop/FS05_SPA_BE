import models from "@models";

export class UserService {
  async getProfile(userId: string) {
    const user = await models.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        email: true,
        phoneNumber: true,
        address: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
