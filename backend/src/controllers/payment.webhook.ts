import { Request, Response } from "express";
import { paymentService } from "../modules/payments/payment.service";
import { logger } from "../utils/logger";

/**
 * PRODUCTION WEBHOOK HANDLER
 * Single Entry Point for Payment Authority.
 */
export const paymentWebhook = async (req: Request, res: Response) => {
  try {
    const signature = (req as any).headers["x-razorpay-signature"] as string;
    
    if (!signature) {
        return (res as any).status(400).json({ message: "Missing signature" });
    }

    // Handlers logic is delegated to service for transaction safety
    const result = await paymentService.handleWebhook(signature, (req as any).body);

    (res as any).json({ status: "ok", ...result });
  } catch (error: any) {
    logger.error(`Webhook Authoritative Error: ${error.message}`);
    // Always return 200 to gateway unless it's a signature fail to prevent retries on logic errors
    (res as any).status(error.status === 400 ? 400 : 200).json({ message: error.message });
  }
};