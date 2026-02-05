
import { db } from "../../config/db";

export const adminRepository = {
  async logAction(adminId: string, action: string, targetId: string, metadata: any = {}) {
    await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_id, metadata)
       VALUES ($1, $2, $3, $4)`,
      [adminId, action, targetId, JSON.stringify(metadata)]
    );
  },

  async suspendProvider(providerId: string, reason: string, adminId: string) {
    return db.transaction(async (client) => {
        // 1. Update Provider Status
        await client.query(
            `UPDATE providers SET approval_status='SUSPENDED' WHERE id=$1`,
            [providerId]
        );
        // 2. Sync User Status
        await client.query(
            `UPDATE users SET verification_status='SUSPENDED' 
             WHERE id=(SELECT user_id FROM providers WHERE id=$1)`,
            [providerId]
        );
        // 3. Log
        await client.query(
            `INSERT INTO admin_logs (admin_id, action, target_id, metadata)
             VALUES ($1, 'SUSPEND_PROVIDER', $2, $3)`,
            [adminId, providerId, JSON.stringify({ reason })]
        );
    });
  },

  async forceCancelBooking(bookingId: string, reason: string, adminId: string) {
    return db.transaction(async (client) => {
        // 1. Cancel Booking
        await client.query(
            `UPDATE bookings SET status='CANCELLED', cancel_reason=$2, cancelled_by='ADMIN' 
             WHERE id=$1`,
            [bookingId, `Admin Override: ${reason}`]
        );
        // 2. Release Locks
        await client.query(`DELETE FROM slot_locks WHERE booking_id=$1`, [bookingId]);
        // 3. Log
        await client.query(
            `INSERT INTO admin_logs (admin_id, action, target_id, metadata)
             VALUES ($1, 'FORCE_CANCEL', $2, $3)`,
            [adminId, bookingId, JSON.stringify({ reason })]
        );
    });
  },

  async forceRefund(bookingId: string, amount: number, reason: string, adminId: string) {
    return db.transaction(async (client) => {
        // 1. Add Ledger Entry
        await client.query(
            `INSERT INTO escrow_ledger (booking_id, amount, type, description)
             VALUES ($1, $2, 'REFUND', $3)`,
            [bookingId, -amount, `Admin Force Refund: ${reason}`]
        );
        // 2. Update Booking Refund Status
        await client.query(
            `UPDATE bookings SET refund_amount = COALESCE(refund_amount, 0) + $2, refund_status='PROCESSED' 
             WHERE id=$1`,
            [bookingId, amount]
        );
        // 3. Log
        await client.query(
            `INSERT INTO admin_logs (admin_id, action, target_id, metadata)
             VALUES ($1, 'FORCE_REFUND', $2, $3)`,
            [adminId, bookingId, JSON.stringify({ amount, reason })]
        );
    });
  },
};
