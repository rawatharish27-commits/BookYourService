
import { db } from "../../config/db";

export const reviewRepository = {
  async canReview(bookingId: string, clientId: string) {
    const rows = await db.query(
      `SELECT id FROM bookings
       WHERE id=$1 AND client_id=$2 AND status='COMPLETED'`,
      [bookingId, clientId]
    );
    return rows.rowCount > 0;
  },

  async exists(bookingId: string) {
    const rows = await db.query(
      `SELECT id FROM reviews WHERE booking_id=$1`,
      [bookingId]
    );
    return rows.rowCount > 0;
  },

  async create(data: {
    bookingId: string;
    clientId: string;
    providerId: string;
    rating: number;
    comment: string;
  }) {
    const rows = await db.query(
      `INSERT INTO reviews
       (booking_id, client_id, provider_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.bookingId, data.clientId, data.providerId, data.rating, data.comment]
    );
    return rows.rows[0];
  },

  async listByProvider(providerId: string) {
    return db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.reply_text, u.name as client_name
       FROM reviews r
       JOIN bookings b ON r.booking_id = b.id
       JOIN users u ON r.client_id = u.id
       WHERE b.provider_id=$1 AND r.visibility_status='VISIBLE'
       ORDER BY r.created_at DESC`,
      [providerId]
    );
  },

  async getReviewDataForCalculation(providerId: string) {
      return db.query(
          `SELECT rating, created_at FROM reviews 
           WHERE provider_id=$1 AND visibility_status='VISIBLE'
           ORDER BY created_at ASC`, // Oldest first for weighting logic
          [providerId]
      );
  }
};
