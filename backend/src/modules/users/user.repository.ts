
import { db } from "../../config/db";

export const userRepository = {
  async getById(id: string) {
    const result = await db.query(
      `SELECT id, email, phone, status, verification_status, created_at, name, role_id 
       FROM users WHERE id=$1`,
      [id]
    );
    return result.rows[0];
  },

  async updateStatus(id: string, status: string) {
    await db.query(
      `UPDATE users SET status=$1 WHERE id=$2`,
      [status, id]
    );
  },
};
