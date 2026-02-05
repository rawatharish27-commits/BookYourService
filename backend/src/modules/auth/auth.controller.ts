import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import jwt from "jsonwebtoken";

const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "strict" : "lax") as "strict" | "lax",
};

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = (req as any).body;

      const result = await authService.login({ email, password });

      (res as any)
        .cookie("access_token", result.accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
        .cookie("refresh_token", result.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .json({ success: true, user: result.user });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = (req as any).cookies.refresh_token;
      if (!refreshToken) throw { status: 401, message: "Unauthorized: Session lost" };

      const tokens = await authService.refresh(refreshToken);

      (res as any)
        .cookie("access_token", tokens.accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
        .cookie("refresh_token", tokens.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 })
        .json({ success: true });
    } catch (err) {
      (res as any).clearCookie("access_token").clearCookie("refresh_token");
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const refreshToken = (req as any).cookies.refresh_token;

      if (userId) {
        await authService.logout(userId, refreshToken);
      }

      (res as any)
        .clearCookie("access_token")
        .clearCookie("refresh_token")
        .json({ success: true, message: "Logged out from device" });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
      try {
          const { email } = (req as any).body;
          if(!email) throw { status: 400, message: "Email required" };
          await authService.forgotPassword(email);
          (res as any).json({ message: "If account exists, reset instructions sent." });
      } catch (e) { next(e); }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
      try {
          const { userId, token, newPassword } = (req as any).body;
          if(!userId || !token || !newPassword) throw { status: 400, message: "Missing fields" };
          await authService.resetPasswordWithId(userId, token, newPassword);
          (res as any).json({ message: "Password updated. Please login." });
      } catch (e) { next(e); }
  }
};