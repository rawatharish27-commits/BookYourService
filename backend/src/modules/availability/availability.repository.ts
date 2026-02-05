
import { db } from "../../config/db";

export const availabilityRepository = {
  async clear(providerId: string) {
    await db.query(
      `DELETE FROM provider_availability WHERE provider_id=$1`,
      [providerId]
    );
  },

  async add(providerId: string, day: number, start: string, end: string) {
    await db.query(
      `INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4)`,
      [providerId, day, start, end]
    );
  },

  async list(providerId: string) {
    const result = await db.query(
      `SELECT day_of_week, start_time, end_time 
       FROM provider_availability
       WHERE provider_id=$1
       ORDER BY day_of_week, start_time`,
      [providerId]
    );
    return result.rows;
  }
};
