
import { db } from "../../config/db";
import { BookingStatus } from "./booking.state";

export const bookingRepository = {
  async create(client: any, data: {
    clientId: string;
    providerId: string;
    serviceId: string;
    scheduledTime: string;
    durationMinutes: number;
    priceDetails: { total: number; base: number; platform: number; provider: number };
    address: string;
    notes: string;
  }) {
    const rows = await client.query(
      `INSERT INTO bookings 
       (id, client_id, provider_id, service_id, scheduled_time, duration_minutes,
        total_amount, base_price, platform_fee, provider_amount, 
        address, notes, status)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PAYMENT_PENDING')
       RETURNING *`,
      [
        data.clientId,
        data.providerId,
        data.serviceId,
        data.scheduledTime,
        data.durationMinutes,
        data.priceDetails.total,
        data.priceDetails.base,
        data.priceDetails.platform,
        data.priceDetails.provider,
        data.address,
        data.notes
      ]
    );
    return rows.rows[0];
  },

  async updateStatus(id: string, status: string, client?: any) {
    const executor = client || db;
    await executor.query(
      `UPDATE bookings SET status=$1, updated_at=NOW() WHERE id=$2`,
      [status, id]
    );
  },

  async findById(id: string) {
    const rows = await db.query(
      `SELECT b.*, 
              s.title as service_title, 
              p.name as provider_name, p.phone as provider_phone,
              c.name as client_name, c.phone as client_phone
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN users p ON p.id = b.provider_id
       JOIN users c ON c.id = b.client_id
       WHERE b.id=$1`,
      [id]
    );
    return rows.rows[0];
  },

  async findByUser(userId: string, role: 'CLIENT' | 'PROVIDER') {
    const column = role === 'CLIENT' ? 'client_id' : 'provider_id';
    const rows = await db.query(
      `SELECT b.*, s.title as service_title, u.name as other_party_name
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN users u ON u.id = (CASE WHEN $2='CLIENT' THEN b.provider_id ELSE b.client_id END)
       WHERE b.${column}=$1
       ORDER BY b.scheduled_time DESC`,
      [userId, role]
    );
    return rows.rows;
  },

  async addEvent(bookingId: string, actorId: string, event: string, client?: any) {
    const executor = client || db;
    await executor.query(
      `INSERT INTO booking_events (id, booking_id, actor_id, reason, new_status)
       VALUES (uuid_generate_v4(), $1, $2, $3, 'UNKNOWN')`, // Simplified log
      [bookingId, actorId, event]
    );
  }
};
