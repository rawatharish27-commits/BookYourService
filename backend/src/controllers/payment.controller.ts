
import { Response, NextFunction } from "express";
import { db } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { env } from "../config/env";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || "test_key",
  key_secret: env.RAZORPAY_KEY_SECRET || "test_secret"
});

/**
 * CLIENT: Create payment order
 * STRICT RULE: Only 'PAYMENT_PENDING' bookings can be paid.
 */
export const createPaymentOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { booking_id } = (req as any).body;
    const clientId = req.user!.id;

    if (!booking_id) return (res as any).status(400).json({ message: "Booking ID is required" });

    const bookingRes = await db.query(
      `SELECT id, total_amount, client_id, status FROM bookings WHERE id=$1`,
      [booking_id]
    );

    if (bookingRes.rowCount === 0) return (res as any).status(404).json({ message: "Booking not found" });
    const booking = bookingRes.rows[0];

    if (booking.client_id !== clientId) return (res as any).status(403).json({ message: "Not your booking" });

    // STRICT CHECK (Phase 6 Updated)
    if (booking.status !== 'PAYMENT_PENDING') {
        return (res as any).status(400).json({ message: `Payment allowed only when booking is PENDING. Current: ${booking.status}` });
    }

    // Check existing
    const paymentCheck = await db.query(
      `SELECT id FROM payments WHERE booking_id=$1 AND verified=true`,
      [booking_id]
    );

    if (paymentCheck.rowCount > 0) return (res as any).status(409).json({ message: "Booking already paid" });

    // Create Order
    const amountInPaise = Math.round(Number(booking.total_amount) * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${booking_id}`,
      notes: { booking_id, client_id: clientId }
    });

    // Insert/Update Payment Record
    await db.query(
      `INSERT INTO payments (booking_id, amount, payment_status, gateway_order_id, gateway)
       VALUES ($1, $2, 'CREATED', $3, 'RAZORPAY')
       ON CONFLICT (booking_id) 
       DO UPDATE SET gateway_order_id = EXCLUDED.gateway_order_id, payment_status = 'CREATED'`,
      [booking_id, booking.total_amount, order.id]
    );

    (res as any).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CLIENT: Get Payment Status (Polling Endpoint)
 */
export const getPaymentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { bookingId } = (req as any).params;
        const clientId = req.user!.id;

        const result = await db.query(
            `SELECT p.payment_status, p.amount, b.client_id 
             FROM payments p 
             JOIN bookings b ON b.id = p.booking_id
             WHERE p.booking_id = $1`,
            [bookingId]
        );

        if (result.rowCount === 0) {
            return (res as any).json({ payment_status: 'NOT_STARTED' });
        }

        if (result.rows[0].client_id !== clientId) {
             return (res as any).status(403).json({ message: "Unauthorized" });
        }

        (res as any).json({ payment_status: result.rows[0].payment_status });
    } catch (e) {
        next(e);
    }
};

/**
 * ADMIN: Initiate Refund
 */
export const initiateRefund = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const { bookingId } = (req as any).body;

    // 1. Check Booking Status
    const bookingRes = await db.query(`SELECT status FROM bookings WHERE id=$1`, [bookingId]);
    if(bookingRes.rowCount === 0) return (res as any).status(404).json({ message: "Booking not found" });
    
    // RULE: No refunds for completed jobs
    if(bookingRes.rows[0].status === 'COMPLETED' || bookingRes.rows[0].status === 'SETTLED') {
        return (res as any).status(400).json({ message: "Cannot refund COMPLETED/SETTLED booking. Manual dispute required." });
    }

    // 2. Check Payment Status
    const paymentRes = await db.query(
      `SELECT id, payment_status, gateway_payment_id, amount FROM payments WHERE booking_id=$1`,
      [bookingId]
    );
    if (paymentRes.rowCount === 0) return (res as any).status(404).json({ message: "Payment not found" });
    const payment = paymentRes.rows[0];

    if (payment.payment_status !== "SUCCESS") {
      return (res as any).status(400).json({ message: `Refund invalid. Payment status: ${payment.payment_status}` });
    }

    // 3. Update DB
    await db.query(`UPDATE payments SET payment_status='REFUND_INITIATED' WHERE id=$1`, [payment.id]);
    await db.query(`INSERT INTO admin_logs (admin_id, action, target_id) VALUES ($1,'REFUND_INITIATED',$2)`, [adminId, bookingId]);

    // 4. Trigger Gateway (Mocked)
    // await razorpay.payments.refund(payment.gateway_payment_id, {});

    (res as any).json({ message: "Refund initiated. Waiting for gateway confirmation." });

  } catch (error) {
    next(error);
  }
};
