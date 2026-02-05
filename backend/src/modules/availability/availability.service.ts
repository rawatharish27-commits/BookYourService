import { availabilityRepository } from "./availability.repository";
import { providerRepository } from "../providers/provider.repository";
import { db } from "../../config/db";

/**
 * SLOT GENERATOR UTILITY
 */
function generateTimeSlots(start: string, end: string, slotMins: number = 60): string[] {
    const slots: string[] = [];
    let [h, m] = start.split(':').map(Number);
    let [endH, endM] = end.split(':').map(Number);
    
    const startTime = h * 60 + m;
    const endTime = endH * 60 + endM;
    let current = startTime;

    while (current + slotMins <= endTime) {
        const curH = Math.floor(current / 60);
        const curM = current % 60;
        slots.push(`${curH.toString().padStart(2, '0')}:${curM.toString().padStart(2, '0')}`);
        current += slotMins;
    }
    return slots;
}

export const availabilityService = {
  /**
   * THE HARD RULE: Is provider actually free?
   * 1. Check Working Hours
   * 2. Check Overlapping Bookings
   */
  async isProviderAvailable(
    providerId: string,
    startTime: string, // ISO String or Date
    durationMinutes: number
  ): Promise<boolean> {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const dayOfWeek = start.getUTCDay();
    const timeOnly = start.toISOString().split('T')[1].substring(0, 5);

    // 1. Check Working Hours
    const workingRes = await db.query(
        `SELECT id FROM provider_availability 
         WHERE provider_id = $1 AND day_of_week = $2 
         AND start_time <= $3::time AND end_time >= ($3::time + ($4 || ' minutes')::interval)`,
        [providerId, dayOfWeek, timeOnly, durationMinutes]
    );
    if (workingRes.rowCount === 0) return false;

    // 2. Check Overlapping Bookings (Atomic Guard)
    // Overlap formula: (StartA < EndB) AND (EndA > StartB)
    const overlapRes = await db.query(
        `SELECT id FROM bookings 
         WHERE provider_id = $1 
         AND status IN ('CONFIRMED', 'PROVIDER_ASSIGNED', 'PROVIDER_ACCEPTED', 'IN_PROGRESS')
         AND scheduled_time < $3 
         AND (scheduled_time + (duration_minutes || ' minutes')::interval) > $2`,
        [providerId, start.toISOString(), end.toISOString()]
    );

    return overlapRes.rowCount === 0;
  },

  async setAvailability(
    userId: string,
    slots: { day: number; start: string; end: string }[]
  ) {
    const provider = await providerRepository.findByUser(userId);
    if (!provider || (provider.approval_status !== "APPROVED" && provider.approval_status !== "LIVE")) {
      throw { status: 403, message: "Provider is not eligible to set availability yet." };
    }

    // CONSISTENCY GUARD (STEP 5.3): Block changes if future bookings exist
    const futureBookings = await db.query(
        `SELECT id FROM bookings 
         WHERE provider_id = $1 AND scheduled_time > NOW()
         AND status IN ('CONFIRMED', 'PROVIDER_ASSIGNED', 'PROVIDER_ACCEPTED', 'IN_PROGRESS')`,
        [userId]
    );

    if (futureBookings.rowCount > 0) {
        throw { status: 400, message: "Cannot change availability while you have active future bookings. Complete or cancel them first." };
    }

    return db.transaction(async (client) => {
        // 1. Clear existing working schedule
        await client.query(`DELETE FROM provider_availability WHERE provider_id=$1`, [userId]);

        // 2. Insert new schedule
        for (const slot of slots) {
            await client.query(
                `INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time)
                 VALUES ($1, $2, $3, $4)`,
                [userId, slot.day, slot.start, slot.end]
            );

            // 3. Optional: Sync Slot Locks for next 30 days (Discovery layer)
            const timeWindows = generateTimeSlots(slot.start, slot.end);
            for (let i = 0; i < 30; i++) {
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + i);
                if (targetDate.getDay() === slot.day) {
                    for (const time of timeWindows) {
                        await client.query(
                            `INSERT INTO slot_locks (provider_id, slot_time, expires_at)
                             VALUES ($1, $2, NOW() - INTERVAL '1 minute')
                             ON CONFLICT DO NOTHING`, 
                             [userId, `${targetDate.toISOString().split('T')[0]}T${time}:00Z`]
                        );
                    }
                }
            }
        }
    });
  },

  async list(userId: string) {
    return availabilityRepository.list(userId);
  },
};