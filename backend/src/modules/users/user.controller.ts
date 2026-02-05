
import { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const userController = {
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const profile = await userService.getProfile(userId);
      (res as any).json(profile);
    } catch (e) {
      next(e);
    }
  },
};
