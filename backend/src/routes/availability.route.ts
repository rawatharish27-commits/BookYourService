import { Router } from "express";
import { db } from "../config/db";

const router = Router();

/**
 * 📅 AVAILABILITY SYNC ENGINE
 * Fetches real-time available slots for a specific provider.
 */
router.get("/:providerId", async (req, res) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query;

    if (!date) {
        return (res as any).status(400).json({ error: "Date query parameter is required" });
    }

    // 1. Get Base Availability for that day of week
    const dayOfWeek = new Date(date as string).getUTCDay();
    
    const availability = await db.query(
      `SELECT start_time, end_time 
       FROM provider_availability 
       WHERE provider_id = $1 AND day_of_week = $2`,
      [providerId, dayOfWeek]
    );

    // 2. Get existing bookings to mark slots as busy
    const busySlots = await db.query(
        `SELECT scheduled_time::time as slot 
         FROM bookings 
         WHERE provider_id = $1 
         AND scheduled_time::date = $2::date
         AND status NOT IN ('CANCELLED', 'FAILED', 'REFUNDED')`,
        [providerId, date]
    );

    const busyTimes = busySlots.rows.map(r => r.slot.substring(0, 5));

    // 3. Generate 2-hour window slots based on availability
    const slots: any[] = [];
    availability.rows.forEach(avail => {
        let current = parseInt(avail.start_time.split(':')[0]);
        const end = parseInt(avail.end_time.split(':')[0]);

        while (current < end) {
            const timeStr = `${current.toString().padStart(2, '0')}:00`;
            const label = current >= 12 
                ? `${current === 12 ? 12 : current - 12}:00 PM` 
                : `${current}:00 AM`;
            
            slots.push({
                value: timeStr,
                label: `${label} - ${(current + 2).toString().padStart(2, '0')}:00`,
                isAvailable: !busyTimes.includes(timeStr)
            });
            current += 2; // 2-hour service windows
        }
    });

    res.json({ slots });
  } catch (e) {
    console.error("Availability Fetch Error:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;