
import { Request, Response, NextFunction } from "express";
import { providerService } from "./provider.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const providerController = {
  async apply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const { bio } = (req as any).body;
      const provider = await providerService.apply(userId, bio);
      (res as any).status(201).json(provider);
    } catch (e) {
      next(e);
    }
  },

  async submitKyc(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const { documentType, documentUrl } = (req as any).body;

      await providerService.submitKyc(userId, documentType, documentUrl);
      (res as any).json({ success: true, message: "KYC Submitted" });
    } catch (e) {
      next(e);
    }
  },

  async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user.id;
      await providerService.approve((req as any).params.id, adminId);
      (res as any).json({ success: true, message: "Provider Approved" });
    } catch (e) {
      next(e);
    }
  },

  async goLive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user.id;
      await providerService.goLive((req as any).params.id, adminId);
      (res as any).json({ success: true, message: "Provider is now LIVE" });
    } catch (e) {
      next(e);
    }
  },
  
  async getMyStatus(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          const provider = await providerService.getStatus(req.user.id);
          if(!provider) return (res as any).status(404).json({ message: "Not a provider" });
          (res as any).json(provider);
      } catch (e) {
          next(e);
      }
  },

  async requestGoLive(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          await providerService.requestGoLive(req.user.id);
          (res as any).json({ message: "You are now LIVE!" });
      } catch (e) {
          next(e);
      }
  },

  async getWallet(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          const data = await providerService.getWallet(req.user.id);
          (res as any).json(data);
      } catch (e) {
          next(e);
      }
  }
};
