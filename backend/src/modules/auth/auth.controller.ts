
import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import jwt from "jsonwebtoken";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = (req as any).body;

      const { accessToken, refreshToken } = await authService.login({
        email,
        password
      });

      (res as any)
        .cookie("access_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
        .cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
        .json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = (req as any).cookies.refresh_token;
      if (!refreshToken) throw { status: 401, message: "No refresh token" };

      const tokens = await authService.refresh(refreshToken);

      (res as any)
        .cookie("access_token", tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
        .cookie("refresh_token", tokens.refreshToken, {
           httpOnly: true,
           secure: process.env.NODE_ENV === "production",
           sameSite: "strict",
        })
        .json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const accessTokenCookie = (req as any).cookies.access_token;
      let sessionId;
      if (accessTokenCookie) {
          const decoded = jwt.decode(accessTokenCookie) as any;
          sessionId = decoded?.sessionId;
      }

      if (sessionId) {
        await authService.logout(sessionId);
      }

      (res as any).clearCookie("access_token").clearCookie("refresh_token").json({
        success: true,
      });
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
