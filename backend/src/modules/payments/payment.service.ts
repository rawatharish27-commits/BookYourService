import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../../config/env";
import { paymentRepository } from "./payment.repository";
import { bookingService } from "../bookings/booking.service";
import { db } from "../../config/db";
import { logger } from "../../utils/logger";
import { BookingStatus } from "../bookings/booking.state";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || "test",
  key_secret: env.RAZORPAY_KEY_SECRET || "test"
});

export const paymentService = {
  // 1️⃣ IDEMPOTENCY CHECK (Core safety)
  async isTransactionProcessed(txnId: string): Promise<boolean> {
    const res = await db.query(
        `SELECT id FROM webhook_events WHERE event_id LIKE $1 AND processed = true`,
        [`%${txnId}%`]
    );
    return res.rowCount > 0;
  },

  // 2️⃣ ATOMIC VERIFICATION (Linked to Booking)
  async markPaymentVerified(bookingId: string, txnId: string, amount: number) {
    return db.transaction(async (client) => {
        // Double Safety: Check if already verified in this transaction
        const already = await client.query(
            `SELECT id FROM payments WHERE gateway_payment_id = $1 AND verified = true`,
            [txnId]
        );
        if (already.rowCount > 0) return;

        // Update Payment Record
        await client.query(
            `UPDATE payments 
             SET payment_status = 'SUCCESS', verified = true, gateway_payment_id = $1 
             WHERE booking_id = $2`,
            [txnId, bookingId]
        );

        // Link Booking Status via Service (Hard Gate)
        await bookingService.updateStatus(bookingId, BookingStatus.CONFIRMED, 'SYSTEM', client);

        // Ledger Entry
        await client.query(
            `INSERT INTO escrow_ledger (booking_id, amount, type, description)
             VALUES ($1, $2, 'DEPOSIT', $3)`,
            [bookingId, amount, `Verified Payment: ${txnId}`]
        );
    });
  },

  async createPaymentIntent(userId: string, bookingId: string) {
    const booking = await bookingService.getDetails(bookingId, userId, "CLIENT");
    
    if (booking.status !== "PAYMENT_PENDING") {
      throw { status: 400, message: "Booking is not in pending payment state" };
    }

    // 🛡️ PAYMENT ABUSE GUARD (STEP 6.6)
    const existingPayment = await paymentRepository.getByBookingId(bookingId);
    if (existingPayment?.verified) {
        throw { status: 400, message: "This booking has already been paid and verified." };
    }

    const amountInPaise = Math.round(Number(booking.total_amount) * 100);
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${bookingId}`,
      notes: { bookingId, userId }
    };

    const order = await razorpay.orders.create(options);

    await paymentRepository.create({
      bookingId,
      amount: Number(booking.total_amount),
      gatewayOrderId: order.id as string,
      gateway: "RAZORPAY"
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID
    };
  },

  async processRefund(bookingId: string, amount: number) {
      const payment = await paymentRepository.getByBookingId(bookingId);
      if (!payment || !payment.gateway_payment_id) {
          throw { status: 400, message: "No successful payment found for this booking" };
      }

      const amountInPaise = Math.round(amount * 100);
      const refund = await razorpay.payments.refund(payment.gateway_payment_id, {
          amount: amountInPaise,
          notes: { reason: "System Refund" }
      });

      return refund;
  },

  async getStatus(bookingId: string) {
    const payment = await paymentRepository.getByBookingId(bookingId);
    if (!payment) return { status: "NOT_STARTED" };
    return { status: payment.payment_status };
  },

  async handleWebhook(signature: string, body: any) {
    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new Error("Webhook secret not configured");

    const expected = crypto.createHmac("sha256", secret).update(JSON.stringify(body)).digest("hex");
    if (signature !== expected) throw { status: 400, message: "Invalid Signature" };

    const event = body.event;
    const payload = body.payload;
    
    if (event === "payment.captured") {
        const paymentEntity = payload.payment.entity;
        const txnId = paymentEntity.id;
        const orderId = paymentEntity.order_id;
        const amount = paymentEntity.amount / 100;

        if (await this.isTransactionProcessed(txnId)) {
            return { success: true, duplicate: true };
        }

        const payRec = await db.query(`SELECT booking_id FROM payments WHERE gateway_order_id = $1`, [orderId]);
        if (payRec.rowCount === 0) throw { status: 404, message: "Order not found" };
        
        const bookingId = payRec.rows[0].booking_id;

        await this.markPaymentVerified(bookingId, txnId, amount);

        await db.query(
            `INSERT INTO webhook_events (event_id, gateway, processed) VALUES ($1, 'RAZORPAY', true)`,
            [`${txnId}_${event}`]
        );
    } 
    
    else if (event === "refund.processed") {
        const refundEntity = payload.refund.entity;
        const txnId = refundEntity.id;
        const paymentId = refundEntity.payment_id;

        if (await this.isTransactionProcessed(txnId)) return { success: true };

        await db.query(
            `UPDATE payments SET payment_status = 'REFUNDED' WHERE gateway_payment_id = $1`,
            [paymentId]
        );

        await db.query(
            `INSERT INTO webhook_events (event_id, gateway, processed) VALUES ($1, 'RAZORPAY', true)`,
            [`${txnId}_${event}`]
        );
    }

    return { success: true };
  }
};