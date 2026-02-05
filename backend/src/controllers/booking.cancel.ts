
import { Response, NextFunction } from "express";
import { db } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { calculateCancellation } from "../utils/cancellationPolicy";

/**
 * PREVIEW CANCELLATION (GET)
 * Returns estimated penalty and refund amount.
 */
export const getCancellationPreview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const bookingId = (req as any).params.id;
        const userId = req.user!.id;
        const role = req.user!.role;

        const bookingRes = await db.query(
            `SELECT b.id, b.total_amount, b.scheduled_time, b.service_id, b.client_id, b.provider_id, b.status, s.category_id
             FROM bookings b
             JOIN services s ON s.id = b.service_id
             WHERE b.id=$1`,
            [bookingId]
        );

        if (bookingRes.rowCount === 0) return (res as any).status(404).json({ message: "Booking not found" });
        const booking = bookingRes.rows[0];

        // Auth Check
        if (role === 'CLIENT' && booking.client_id !== userId) return (res as any).status(403).json({ message: "Unauthorized" });
        if (role === 'PROVIDER' && booking.provider_id !== userId) return (res as any).status(403).json({ message: "Unauthorized" });

        const result = await calculateCancellation(booking, role === 'PROVIDER' ? 'PROVIDER' : 'CLIENT');
        
        (res as any).json({
            bookingId,
            ...result,
            isRefundable: result.refundAmount > 0
        });

    } catch (e) { next(e); }
};

/**
 * EXECUTE CANCELLATION (PATCH)
 * Enforces: Ownership, State, Penalty Calculation, Ledger Update, Slot Release
 */
export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const client = await db.connect();
  try {
    const bookingId = (req as any).params.id;
    const { reason } = (req as any).body;
    const userId = req.user!.id;
    const role = req.user!.role; 

    if (!reason || reason.trim().length < 5) {
      return (res as any).status(400).json({ message: "Cancel reason required (min 5 chars)" });
    }

    await client.query("BEGIN");

    // 1. Fetch Booking Locked
    const bookingRes = await client.query(
      `SELECT b.id, b.status, b.client_id, b.provider_id, b.total_amount, b.scheduled_time, b.service_id, s.category_id
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       WHERE b.id=$1 FOR UPDATE`,
      [bookingId]
    );

    if (bookingRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return (res as any).status(404).json({ message: "Booking not found" });
    }

    const booking = bookingRes.rows[0];

    // 2. Ownership Check
    if (
      (role === "CLIENT" && booking.client_id !== userId) ||
      (role === "PROVIDER" && booking.provider_id !== userId)
    ) {
      await client.query("ROLLBACK");
      return (res as any).status(403).json({ message: "Not your booking" });
    }

    // 3. State Check
    const cancellableStates = ["INITIATED", "SLOT_LOCKED", "PAYMENT_PENDING", "CONFIRMED", "PROVIDER_ASSIGNED"];
    if (!cancellableStates.includes(booking.status)) {
      await client.query("ROLLBACK");
      return (res as any).status(400).json({
        message: `Cancellation not allowed. Current status: ${booking.status}`
      });
    }

    // 4. Calculate Financials (Only if paid/confirmed)
    let penalty = 0;
    let refund = 0;
    
    if (['CONFIRMED', 'PROVIDER_ASSIGNED'].includes(booking.status)) {
        const calc = await calculateCancellation(booking, role === 'PROVIDER' ? 'PROVIDER' : 'CLIENT');
        penalty = calc.penaltyAmount;
        refund = calc.refundAmount;
        
        // Ledger Logic
        if (penalty > 0) {
            await client.query(
                `INSERT INTO escrow_ledger (booking_id, amount, type, description)
                 VALUES ($1, $2, 'PENALTY', $3)`,
                [bookingId, penalty, role === 'CLIENT' ? 'Client Cancellation Penalty' : 'Provider Penalty']
            );
        }
        
        if (refund > 0) {
            // Log Refund Intent (Real refund via Gateway API happens async or via admin trigger usually, keeping it logical here)
            await client.query(
                `INSERT INTO escrow_ledger (booking_id, amount, type, description)
                 VALUES ($1, $2, 'REFUND', 'Refund Pending via Gateway')`,
                [bookingId, -refund] // Outflow
            );
            // In real world: Call Razorpay Refund API here. If fails, log error but cancel booking.
        }
    }

    // 5. Update Booking Status
    await client.query(
      `UPDATE bookings
       SET status='CANCELLED',
           cancel_reason=$1,
           cancelled_by=$2,
           penalty_amount=$3,
           refund_amount=$4,
           refund_status=$5
       WHERE id=$6`,
      [reason, role, penalty, refund, refund > 0 ? 'PENDING' : 'NONE', bookingId]
    );

    // 6. Release Slot Lock
    await client.query(`DELETE FROM slot_locks WHERE booking_id=$1`, [bookingId]);

    // 7. Audit Log
    await client.query(
        `INSERT INTO booking_events (booking_id, old_status, new_status, actor_id, reason, metadata)
         VALUES ($1, $2, 'CANCELLED', $3, $4, $5)`,
        [bookingId, booking.status, userId, reason, JSON.stringify({ penalty, refund })]
    );

    // 8. Stats Update
    if (role === 'PROVIDER') {
        await client.query(`UPDATE provider_stats SET cancelled_bookings = cancelled_bookings + 1 WHERE provider_id=$1`, [userId]);
    } else if (booking.provider_id) {
        // Client cancelled, maybe update provider stats to reflect lost job but not their fault?
        // Usually we track "Client Cancels" separately. For now, no-op.
    }

    await client.query("COMMIT");
    (res as any).json({ 
        message: "Booking cancelled successfully", 
        refundAmount: refund,
        penaltyAmount: penalty
    });

  } catch (error) {
    await client.query("ROLLBACK");
    next(error);
  } finally {
    client.release();
  }
};
