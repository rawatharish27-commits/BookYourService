
import { db } from "../../config/db";

export const providerRepository = {
  async create(userId: string, bio: string) {
    const result = await db.query(
      `INSERT INTO providers (user_id, bio, approval_status)
       VALUES ($1, $2, 'REGISTERED')
       RETURNING *`,
      [userId, bio]
    );
    return result.rows[0];
  },

  async findByUser(userId: string) {
    const result = await db.query(
      `SELECT * FROM providers WHERE user_id=$1`,
      [userId]
    );
    return result.rows[0];
  },

  async findById(providerId: string) {
    const result = await db.query(
      `SELECT * FROM providers WHERE id=$1`,
      [providerId]
    );
    return result.rows[0];
  },

  async updateStatus(providerId: string, status: string) {
    await db.query(
      `UPDATE providers SET approval_status=$1 WHERE id=$2`,
      [status, providerId]
    );
    // Also sync user verification_status for easy access
    await db.query(
      `UPDATE users SET verification_status=$1 WHERE id=(SELECT user_id FROM providers WHERE id=$2)`,
      [status, providerId]
    );
  },

  async addKyc(providerId: string, type: string, url: string) {
    await db.query(
      `INSERT INTO provider_kyc (provider_id, document_type, document_url)
       VALUES ($1, $2, $3)`,
      [providerId, type, url]
    );
  },
  
  async logStatusChange(providerId: string, oldStatus: string | null, newStatus: string, changedBy: string, reason: string) {
      await db.query(
        `INSERT INTO provider_status_history (provider_id, old_status, new_status, changed_by, reason) 
         VALUES ($1, $2, $3, $4, $5)`,
        [providerId, oldStatus, newStatus, changedBy, reason]
      );
  }
};
