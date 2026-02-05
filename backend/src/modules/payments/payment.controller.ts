
import { Request, Response, NextFunction } from "express";
import { paymentService } from "./payment.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const paymentController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { booking_id } = (req as any).body;
      const result = await paymentService.createPaymentIntent(userId, booking_id);
      (res as any).json(result);
    } catch (e) {
      next(e);
    }
  },

  async getStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = (req as any).params;
      const result = await paymentService.getStatus(bookingId);
      (res as any).json({ payment_status: result.status });
    } catch (e) {
      next(e);
    }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = (req as any).headers["x-razorpay-signature"] as string;
      const result = await paymentService.handleWebhook(signature, (req as any).body);
      (res as any).json(result);
    } catch (e) {
      next(e);
    }
  }
};
