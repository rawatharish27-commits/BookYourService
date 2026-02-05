
import { Request, Response, NextFunction } from "express";
import { cancellationService } from "./cancellation.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const cancellationController = {
  async clientCancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookingId = (req as any).params.id;
      const { reason } = (req as any).body;
      const clientId = req.user!.id;

      const result = await cancellationService.cancelByClient(bookingId, clientId, reason || "Client Cancelled");
      (res as any).json(result);
    } catch (e) {
      next(e);
    }
  },

  async providerCancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookingId = (req as any).params.id;
      const { reason } = (req as any).body;
      const providerId = req.user!.id;

      const result = await cancellationService.cancelByProvider(bookingId, providerId, reason || "Provider Cancelled");
      (res as any).json(result);
    } catch (e) {
      next(e);
    }
  },
};
