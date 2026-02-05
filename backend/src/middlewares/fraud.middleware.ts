
import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { db } from "../config/db";
import { logger } from "../utils/logger";

/**
 * FRAUD PREVENTION MIDDLEWARE
 * Rules:
 * A. Rapid Cancel Check: Block if > 3 cancellations in 24h.
 * B. Slot Hogging: Block duplicate bookings for same slot.
 */
export const checkBookingFraud = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const clientId = req.user!.id;
        const { scheduled_time } = (req as any).body;

        // Rule A: Rapid Cancel Check
        const cancelStats = await db.query(
            `SELECT COUNT(*) as count FROM bookings 
             WHERE client_id=$1 AND status='CANCELLED' 
             AND created_at > NOW() - INTERVAL '24 hours'`,
            [clientId]
        );
        
        if (parseInt(cancelStats.rows[0].count) > 3) {
            logger.warn(`Fraud Alert: Client ${clientId} hitting cancellation limit.`);
            return (res as any).status(429).json({ 
                message: "Booking temporarily restricted due to high cancellation rate. Try again in 24 hours." 
            });
        }

        // Rule B: Slot Hogging (Duplicate slot check)
        if (scheduled_time) {
            // Check for any active booking at the same time
            const slotCheck = await db.query(
                `SELECT id FROM bookings 
                 WHERE client_id=$1 AND scheduled_time=$2 
                 AND status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS')`,
                [clientId, scheduled_time]
            );
            
            if (slotCheck.rowCount > 0) {
                 return (res as any).status(409).json({ message: "You already have a booking for this time slot." });
            }
        }

        next();
    } catch (error) {
        logger.error("Fraud Middleware Error", error);
        next(error); // Don't block flow on error, but log it. Or fail safe.
    }
};
