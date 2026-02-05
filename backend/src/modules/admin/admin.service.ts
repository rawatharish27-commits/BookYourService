
import { Response, NextFunction } from "express";
import { db } from "../../config/db";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { AdminLogModel } from "../../models/adminLog.model";
import { BookingStatus } from "../bookings/booking.state";
import { bookingService } from "../bookings/booking.service";
import { paymentService } from "../payments/payment.service";

export const adminService = {
  /**
   * FORCE CANCEL: Admin bypass of state machine to kill a booking.
   */
  async forceCancelBooking(bookingId: string, adminId: string, reason: string) {
    return db.transaction(async (client) => {
      // 1. Perform override via Booking Service (using internal flag)
      const booking = await bookingService.updateStatus(
        bookingId, 
        BookingStatus.CANCELLED, 
        adminId, 
        client,
        true // isAdminOverride = true
      );

      // 2. Log Action
      // Fix: Added missing targetType 'BOOKING' as the 3rd argument
      await AdminLogModel.log(adminId, 'FORCE_CANCEL_BOOKING', 'BOOKING', bookingId, { reason }, client);

      return booking;
    });
  },

  /**
   * FORCE REFUND: Admin triggers financial reversal and booking update.
   */
  async forceRefundPayment(bookingId: string, adminId: string, reason: string) {
    return db.transaction(async (client) => {
      // 1. Get Payment Details
      const payRes = await client.query(`SELECT amount FROM payments WHERE booking_id = $1`, [bookingId]);
      if (payRes.rowCount === 0) throw { status: 404, message: "No payment record found for this booking" };
      const amount = Number(payRes.rows[0].amount);

      // 2. Trigger Gateway Refund (Service Level)
      await paymentService.processRefund(bookingId, amount);

      // 3. Update DB State
      await client.query(
        `UPDATE payments SET payment_status = 'REFUNDED', verified = false WHERE booking_id = $1`,
        [bookingId]
      );

      // 4. Update Booking State
      await bookingService.updateStatus(bookingId, BookingStatus.REFUNDED, adminId, client, true);

      // 5. Audit
      // Fix: Added missing targetType 'PAYMENT' as the 3rd argument
      await AdminLogModel.log(adminId, 'FORCE_REFUND', 'PAYMENT', bookingId, { amount, reason }, client);

      return { success: true, amount };
    });
  },

  async suspendProvider(providerId: string, reason: string, adminId: string) {
    if (!reason) throw { status: 400, message: "Reason required" };
    
    await db.transaction(async (client) => {
        await client.query(`UPDATE providers SET approval_status='SUSPENDED' WHERE id=$1`, [providerId]);
        await client.query(
            `UPDATE users SET verification_status='SUSPENDED' WHERE id=(SELECT user_id FROM providers WHERE id=$1)`,
            [providerId]
        );
        // Fix: Added missing targetType 'USER' as the 3rd argument
        await AdminLogModel.log(adminId, 'SUSPEND_PROVIDER', 'USER', providerId, { reason }, client);
    });
  }
};
