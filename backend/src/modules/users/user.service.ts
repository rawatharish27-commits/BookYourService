
import { userRepository } from "./user.repository";

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.getById(userId);
    if (!user) throw { status: 404, message: "User not found" };
    return user;
  },
};
