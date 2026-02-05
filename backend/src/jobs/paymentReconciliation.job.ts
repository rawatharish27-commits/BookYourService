import { db } from "../config/db";
import { logger } from "../utils/logger";
import { paymentService } from "../modules/payments/payment.service";
import Razorpay from "razorpay";
import { env } from "../config/env";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || "test",
  key_secret: env.RAZORPAY_KEY_SECRET || "test"
});

/**
 * 🕵️ PHASE 5.2: PAYMENT RECONCILIATION JOB
 * Automatically recovers from missed webhooks by querying the Gateway API directly.
 */
export class PaymentReconciliationJob {
    private isRunning = false;
    private interval = 10 * 60 * 1000; // 10 minutes

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        logger.info("🕒 Payment Reconciliation Job Started");
        this.loop();
    }

    private async loop() {
        while (this.isRunning) {
            try {
                await this.reconcile();
            } catch (e) {
                logger.error("Reconciliation Loop Error", e);
            }
            await new Promise(r => setTimeout(r, this.interval));
        }
    }

    private async reconcile() {
        // Find bookings stuck in PAYMENT_PENDING that have a created order but no verification
        const stuckBookings = await db.query(
            `SELECT b.id, p.gateway_order_id, b.total_amount 
             FROM bookings b
             JOIN payments p ON p.booking_id = b.id
             WHERE b.status = 'PAYMENT_PENDING'
             AND p.verified = false
             AND b.created_at < NOW() - INTERVAL '15 minutes'
             LIMIT 50`
        );

        for (const row of stuckBookings.rows) {
            try {
                // Fetch actual status from Razorpay
                const payments: any = await razorpay.orders.fetchPayments(row.gateway_order_id);
                
                // If any payment for this order is 'captured', update our DB
                const captured = payments.items.find((p: any) => p.status === 'captured');
                if (captured) {
                    logger.info(`Reconciliation found missed payment: Booking ${row.id}, Txn ${captured.id}`);
                    await paymentService.markPaymentVerified(row.id, captured.id, captured.amount / 100);
                }
            } catch (err: any) {
                logger.warn(`Reconciliation failed for booking ${row.id}: ${err.message}`);
            }
        }
    }

    stop() {
        this.isRunning = false;
    }
}

export const paymentReconciliationJob = new PaymentReconciliationJob();