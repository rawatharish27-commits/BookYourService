
import { db } from "../../config/db";
import { PaymentStatus, Gateway } from "./payment.types";

export const paymentRepository = {
  async create(data: {
    bookingId: string;
    amount: number;
    gatewayOrderId: string;
    gateway: Gateway;
  }) {
    const result = await db.query(
      `INSERT INTO payments (booking_id, amount, payment_status, gateway_order_id, gateway, verified)
       VALUES ($1, $2, 'CREATED', $3, $4, false)
       ON CONFLICT (booking_id) 
       DO UPDATE SET gateway_order_id = EXCLUDED.gateway_order_id, payment_status = 'CREATED'
       RETURNING *`,
      [data.bookingId, data.amount, data.gatewayOrderId, data.gateway]
    );
    return result.rows[0];
  },

  async updateStatus(gatewayOrderId: string, status: PaymentStatus, gatewayPaymentId?: string) {
    const result = await db.query(
      `UPDATE payments 
       SET payment_status = $1, 
           verified = $2, 
           gateway_payment_id = COALESCE($3, gateway_payment_id)
       WHERE gateway_order_id = $4
       RETURNING booking_id, amount`,
      [status, status === 'SUCCESS', gatewayPaymentId, gatewayOrderId]
    );
    return result.rows[0];
  },

  async getByBookingId(bookingId: string) {
    const result = await db.query(
      `SELECT * FROM payments WHERE booking_id = $1`,
      [bookingId]
    );
    return result.rows[0];
  },

  // --- ESCROW LEDGER ---
  async addLedgerEntry(data: {
    bookingId: string;
    amount: number;
    type: 'DEPOSIT' | 'RELEASE' | 'REFUND' | 'COMMISSION';
    description: string;
  }) {
    await db.query(
      `INSERT INTO escrow_ledger (booking_id, amount, type, description)
       VALUES ($1, $2, $3, $4)`,
      [data.bookingId, data.amount, data.type, data.description]
    );
  },

  // --- WEBHOOK IDEMPOTENCY ---
  async isEventProcessed(eventId: string): Promise<boolean> {
    const res = await db.query(`SELECT id FROM webhook_events WHERE event_id = $1`, [eventId]);
    return res.rowCount > 0;
  },

  async markEventProcessed(eventId: string, gateway: Gateway) {
    await db.query(
      `INSERT INTO webhook_events (event_id, gateway, processed) VALUES ($1, $2, true)`,
      [eventId, gateway]
    );
  }
};
