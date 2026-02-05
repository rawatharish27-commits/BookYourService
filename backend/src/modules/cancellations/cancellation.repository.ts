
import { db } from "../../config/db";

// Ensure Refunds table exists (Lazy Migration)
const ensureRefundsTable = async () => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS refunds (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        payment_id UUID NOT NULL REFERENCES payments(id),
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `).catch(console.error);
};
ensureRefundsTable();

export const cancellationRepository = {
  async markCancelled(bookingId: string, reason: string, actor: string) {
    await db.query(
      `UPDATE bookings SET status='CANCELLED' WHERE id=$1`,
      [bookingId]
    );

    await db.query(
      `INSERT INTO booking_events (booking_id, actor_id, reason, new_status)
       VALUES ($1, 'SYSTEM', $2, 'CANCELLED')`,
      [bookingId, `CANCELLED by ${actor}: ${reason}`]
    );
  },

  async createRefund(paymentId: string, amount: number, reason: string) {
    const rows = await db.query(
      `INSERT INTO refunds (payment_id, amount, status, reason)
       VALUES ($1, $2, 'PENDING', $3)
       RETURNING *`,
      [paymentId, amount, reason]
    );
    return rows.rows[0];
  },

  async markRefundSuccess(refundId: string) {
    await db.query(
      `UPDATE refunds SET status='SUCCESS' WHERE id=$1`,
      [refundId]
    );
  },
};
