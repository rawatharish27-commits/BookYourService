import { Request, Response, NextFunction } from "express";
import { paymentService } from "./payment.service";
import { AuthRequest } from "../../middlewares/auth.middleware";

export const paymentController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { booking_id } = (req as any).body;
      // Cast req to any to safely access headers across different environment type definitions
      const idempotencyKey = (req as any).headers['x-idempotency-key'] as string;

      // 🛡️ PHASE 5: IDEMPOTENCY CHECK
      if (idempotencyKey) {
          const cached = await paymentService.getCachedResponse(idempotencyKey, userId);
          if (cached) {
              return res.status(cached.status_code).json(cached.response_body);
          }
      }

      const result = await paymentService.createPaymentIntent(userId, booking_id);

      // 🛡️ PHASE 5: SAVE RESPONSE FOR FUTURE RETRIES
      if (idempotencyKey) {
          await paymentService.saveIdempotency(idempotencyKey, userId, 200, result);
      }

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