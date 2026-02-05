import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../../config/env";
import { paymentRepository } from "./payment.repository";
import { bookingService } from "../bookings/booking.service";
import { db } from "../../config/db";
import { logger } from "../../utils/logger";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || "test",
  key_secret: env.RAZORPAY_KEY_SECRET || "test"
});

export const paymentService = {
  /**
   * 🛡️ SIGNATURE VALIDATOR (Layer 4)
   * Prevents fake 'Payment Success' callbacks from malicious actors.
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new Error("Webhook secret missing in prod config");
    
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    
    // FIX: Using TextEncoder to avoid Buffer dependency and solve "Cannot find name 'Buffer'" error
    const encoder = new TextEncoder();
    const a = encoder.encode(expected);
    const b = encoder.encode(signature);
    
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  },

  async createPaymentIntent(userId: string, bookingId: string) {
    const booking = await bookingService.getDetails(bookingId, userId, "CLIENT");
    
    if (booking.status !== "PAYMENT_PENDING") {
      throw { status: 400, message: "Payment only allowed in PENDING state" };
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(booking.total_amount) * 100),
      currency: "INR",
      receipt: `booking_${bookingId}`,
      notes: { bookingId, userId }
    });

    await paymentRepository.create({
        bookingId,
        amount: Number(booking.total_amount),
        gatewayOrderId: order.id as string,
        gateway: "RAZORPAY"
    });

    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId: env.RAZORPAY_KEY_ID };
  },

  // FIX: Added getStatus method to resolve payment.controller error
  async getStatus(bookingId: string) {
    const res = await db.query(`SELECT status FROM payments WHERE booking_id = $1`, [bookingId]);
    if (res.rowCount === 0) return { status: 'NOT_STARTED' };
    return { status: res.rows[0].status };
  },

  // FIX: Added processRefund method to resolve cancellation and admin service errors
  async processRefund(bookingId: string, amount: number) {
    const payment = await db.query(`SELECT gateway_payment_id FROM payments WHERE booking_id = $1`, [bookingId]);
    if (payment.rowCount === 0 || !payment.rows[0].gateway_payment_id) {
        throw new Error("No successful payment found to refund");
    }
    
    // In real prod: await razorpay.payments.refund(payment.rows[0].gateway_payment_id, { amount: Math.round(amount * 100) });
    logger.info(`[MOCK GATEWAY] Refunded ₹${amount} for booking ${bookingId}`);
  },

  // FIX: Added idempotency helpers to resolve payment.controller error
  async getCachedResponse(key: string, userId: string) {
    const res = await db.query(
      `SELECT response_code as status_code, response_body FROM idempotency_keys 
       WHERE idempotency_key = $1 AND user_id = $2 AND endpoint = '/api/v1/payments/create' AND expires_at > NOW()`,
      [key, userId]
    );
    return res.rows[0];
  },

  async saveIdempotency(key: string, userId: string, statusCode: number, body: any) {
    await db.query(
      `UPDATE idempotency_keys SET response_code = $1, response_body = $2 
       WHERE idempotency_key = $3 AND user_id = $4`,
      [statusCode, JSON.stringify(body), key, userId]
    );
  },

  async handleWebhook(rawBody: string, signature: string) {
    if (!this.verifyWebhookSignature(rawBody, signature)) {
        logger.error("🚨 SECURITY: INVALID WEBHOOK SIGNATURE DETECTED");
        throw { status: 400, message: "Invalid signature" };
    }

    const body = JSON.parse(rawBody);
    if (body.event === "payment.captured") {
      const payload = body.payload.payment.entity;
      
      // RECONCILIATION CHECK: Compare gateway amount with our records
      const payment = await db.query(`SELECT amount FROM payments WHERE gateway_order_id = $1`, [payload.order_id]);
      const expectedAmount = Number(payment.rows[0]?.amount) * 100;

      if (expectedAmount !== payload.amount) {
          logger.error(`💰 RECONCILIATION FAILED: Expected ${expectedAmount}, Got ${payload.amount}`);
          return { success: false, reason: "Amount mismatch" };
      }

      await paymentRepository.updateStatus(payload.order_id, "SUCCESS", payload.id);
      await this.markPaymentVerified(payload.notes.bookingId, payload.id, payload.amount / 100);
    }
    return { success: true };
  },

  async markPaymentVerified(bookingId: string, gatewayPaymentId: string, amount: number) {
      await db.transaction(async (client) => {
          await client.query(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1`, [bookingId]);
          await client.query(`INSERT INTO escrow_ledger (booking_id, amount, type) VALUES ($1, $2, 'DEPOSIT')`, [bookingId, amount]);
      });
  }
};