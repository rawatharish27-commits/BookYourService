import { db } from "../../config/db";
import { PoolClient } from "pg";

export const slotLockService = {
  /**
   * Locks a specific time slot for a provider.
   * Throws 409 if already locked or booked.
   * Supports external transaction client for physical atomicity.
   */
  async lockSlot(
    providerId: string, 
    slotTime: string, 
    durationMinutes: number = 60, 
    ttlMinutes: number = 15,
    externalClient?: PoolClient
  ) {
    const exec = async (client: PoolClient) => {
      // 1. Clean up expired locks first (Prevent stale lock blockage)
      await client.query(`DELETE FROM slot_locks WHERE expires_at < NOW()`);

      // 2. Hard Check: Already booked in 'bookings' table?
      const bookingConflict = await client.query(
        `SELECT id FROM bookings 
         WHERE provider_id=$1 
         AND scheduled_time=$2 
         AND status NOT IN ('CANCELLED', 'FAILED', 'REFUNDED')`,
        [providerId, slotTime]
      );

      if (bookingConflict.rowCount > 0) {
        throw { status: 409, message: "Slot already booked" };
      }

      // 3. Attempt to Insert Lock (Atomic Guard)
      // The UNIQUE(provider_id, slot_time) index in DB is the ultimate authority.
      try {
        const expiresAt = new Date(Date.now() + ttlMinutes * 60000);
        
        await client.query(
          `INSERT INTO slot_locks (provider_id, slot_time, duration_minutes, expires_at)
           VALUES ($1, $2, $3, $4)`,
          [providerId, slotTime, durationMinutes, expiresAt]
        );
      } catch (err: any) {
        if (err.code === '23505') { // Postgres Unique Violation code
            throw { status: 409, message: "Concurrency Conflict: Slot is being booked by another process" };
        }
        throw err;
      }
    };

    // Participate in existing transaction or start a new one
    if (externalClient) {
        return await exec(externalClient);
    } else {
        return await db.transaction(exec);
    }
  },

  async releaseLock(providerId: string, slotTime: string) {
    await db.query(`DELETE FROM slot_locks WHERE provider_id=$1 AND slot_time=$2`, [providerId, slotTime]);
  },
  
  async releaseByBookingId(bookingId: string) {
      await db.query(`DELETE FROM slot_locks WHERE booking_id=$1`, [bookingId]);
  }
};