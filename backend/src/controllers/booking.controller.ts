
import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { allowedTransitions, canTransition } from "../utils/bookingState";
import { BookingStatus } from "../../../src/types";

const PLATFORM_FEE_PERCENT = 0.10; // 10%
const SLOT_LOCK_DURATION_MINS = 15;

/**
 * INITIATE BOOKING (ATOMIC TRANSACTION)
 * 1. Find Provider
 * 2. Lock Slot
 * 3. Create Booking
 */
export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const clientDb = await db.connect();
  try {
    const clientId = req.user!.id;
    const { subcategory_id, zone_id, scheduled_time, address, notes } = (req as any).body;

    if (!subcategory_id || !zone_id || !scheduled_time || !address) {
        return (res as any).status(400).json({ message: "Missing required fields" });
    }

    await clientDb.query("BEGIN");

    // 1. FIND PROVIDER (Simplified ranking for Phase 6)
    const serviceSearch = await clientDb.query(
        `SELECT s.id, s.provider_id, s.price, s.duration_minutes
         FROM services s
         JOIN users u ON u.id = s.provider_id
         LEFT JOIN provider_stats ps ON ps.provider_id = s.provider_id
         WHERE s.subcategory_id = $1 
         AND s.zone_id = $2
         AND s.is_active = true 
         AND s.is_approved = true
         AND u.verification_status = 'APPROVED'
         AND COALESCE(ps.no_show_count, 0) < 3
         ORDER BY s.price ASC
         LIMIT 5`, 
         [subcategory_id, zone_id]
    );

    if (serviceSearch.rowCount === 0) {
        await clientDb.query("ROLLBACK");
        return (res as any).status(404).json({ message: "No qualified providers available in this zone." });
    }

    const bookDate = new Date(scheduled_time);
    
    // 2. CHECK AVAILABILITY & LOCK SLOT
    let selectedService = null;
    
    for (const cand of serviceSearch.rows) {
        if (cand.provider_id === clientId) continue;

        // A. Check Slot Lock Table
        const lockCheck = await clientDb.query(
            `SELECT id FROM slot_locks 
             WHERE provider_id=$1 AND slot_time=$2 AND expires_at > NOW()`,
            [cand.provider_id, scheduled_time]
        );
        if (lockCheck.rowCount > 0) continue; 

        // B. Check Confirmed Bookings
        const bookingCheck = await clientDb.query(
            `SELECT id FROM bookings 
             WHERE provider_id=$1 AND scheduled_time=$2 
             AND status NOT IN ('CANCELLED','FAILED','REFUNDED')`,
            [cand.provider_id, scheduled_time]
        );
        if (bookingCheck.rowCount > 0) continue;

        // C. Lock It
        try {
            await clientDb.query(
                `INSERT INTO slot_locks (provider_id, slot_time, duration_minutes, expires_at)
                 VALUES ($1, $2, $3, NOW() + INTERVAL '${SLOT_LOCK_DURATION_MINS} minutes')`,
                [cand.provider_id, scheduled_time, cand.duration_minutes || 60]
            );
            selectedService = cand;
            break; 
        } catch (e) {
            continue; 
        }
    }

    if (!selectedService) {
        await clientDb.query("ROLLBACK");
        return (res as any).status(409).json({ message: "All providers are busy for this slot. Please try another time." });
    }

    // 3. CREATE BOOKING (State: PAYMENT_PENDING)
    const basePrice = Number(selectedService.price);
    const platformFee = Number((basePrice * PLATFORM_FEE_PERCENT).toFixed(2));
    const providerAmount = basePrice - platformFee;

    const bookingRes = await clientDb.query(
      `INSERT INTO bookings 
       (client_id, provider_id, service_id, scheduled_time, duration_minutes,
        total_amount, base_price, platform_fee, tax, provider_amount, 
        address, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PAYMENT_PENDING')
       RETURNING id, status`,
      [clientId, selectedService.provider_id, selectedService.id, scheduled_time, selectedService.duration_minutes || 60,
       basePrice, basePrice, platformFee, 0, providerAmount, address, notes]
    );

    const bookingId = bookingRes.rows[0].id;

    // 4. LINK LOCK TO BOOKING
    await clientDb.query(
        `UPDATE slot_locks SET booking_id=$1 WHERE provider_id=$2 AND slot_time=$3`,
        [bookingId, selectedService.provider_id, scheduled_time]
    );

    // 5. AUDIT EVENT
    await clientDb.query(
        `INSERT INTO booking_events (booking_id, old_status, new_status, actor_id, reason)
         VALUES ($1, NULL, 'PAYMENT_PENDING', $2, 'Booking Initiated')`,
        [bookingId, clientId]
    );

    // 6. INIT STATS
    await clientDb.query(`INSERT INTO provider_stats (provider_id) VALUES ($1) ON CONFLICT DO NOTHING`, [selectedService.provider_id]);

    await clientDb.query("COMMIT");

    (res as any).status(201).json({
      success: true,
      booking: bookingRes.rows[0],
      message: "Slot reserved! Proceed to payment within 15 minutes."
    });

  } catch (err) {
    await clientDb.query("ROLLBACK");
    next(err);
  } finally {
    clientDb.release();
  }
};

/**
 * getBookingById
 */
export const getBookingById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookingId = (req as any).params.id;
    const userId = req.user!.id;
    const role = req.user!.role;

    const result = await db.query(
      `SELECT b.id, b.status, b.scheduled_time, b.total_amount, b.address, b.notes,
              b.client_id, b.provider_id, b.base_price, b.platform_fee, b.tax,
              b.created_at,
              s.title as service_title,
              p.name as provider_name, p.phone as provider_phone,
              c.name as client_name, c.phone as client_phone,
              COALESCE(ps.avg_rating, 0) as provider_rating
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN users c ON c.id = b.client_id
       JOIN users p ON p.id = b.provider_id
       LEFT JOIN provider_stats ps ON ps.provider_id = b.provider_id
       WHERE b.id = $1`,
      [bookingId]
    );

    if (result.rowCount === 0) return (res as any).status(404).json({ message: "Booking not found" });
    const booking = result.rows[0];

    // Authorization
    if (role === 'CLIENT' && booking.client_id !== userId) return (res as any).status(403).json({ message: "Forbidden" });
    if (role === 'PROVIDER' && booking.provider_id !== userId) return (res as any).status(403).json({ message: "Forbidden" });

    // Privacy Gate
    let providerDetails = null;
    if (role === 'CLIENT') {
        if (['CONFIRMED', 'PROVIDER_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'SETTLED'].includes(booking.status)) {
            providerDetails = {
                name: booking.provider_name,
                phone: booking.provider_phone,
                rating: Number(booking.provider_rating)
            };
        }
    } else if (role === 'PROVIDER') {
        if (['CONFIRMED', 'PROVIDER_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'SETTLED'].includes(booking.status)) {
            providerDetails = {
                clientName: booking.client_name,
                clientPhone: booking.client_phone
            }
        }
    }

    (res as any).json({
        id: booking.id,
        status: booking.status,
        scheduled_time: booking.scheduled_time,
        created_at: booking.created_at,
        address: booking.address,
        notes: booking.notes,
        service: {
            title: booking.service_title,
        },
        pricing: {
            base_price: Number(booking.base_price),
            platform_fee: Number(booking.platform_fee),
            tax: Number(booking.tax),
            total: Number(booking.total_amount)
        },
        provider: providerDetails
    });

  } catch (error) { next(error); }
};

/**
 * updateBookingStatus (Transition & Settlement Engine)
 */
export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const clientDb = await db.connect();
  try {
    const bookingId = (req as any).params.id;
    const { newStatus } = (req as any).body;
    const userId = req.user!.id;

    await clientDb.query("BEGIN");

    const bookingRes = await clientDb.query(
      `SELECT status, provider_id, provider_amount, platform_fee, total_amount, client_id FROM bookings WHERE id=$1 FOR UPDATE`,
      [bookingId]
    );

    if (bookingRes.rowCount === 0) {
        await clientDb.query("ROLLBACK");
        return (res as any).status(404).json({ message: "Booking not found" });
    }

    const booking = bookingRes.rows[0];

    // Auth Check
    if (booking.provider_id !== userId) {
        await clientDb.query("ROLLBACK");
        return (res as any).status(403).json({ message: "Unauthorized" });
    }

    // State Machine Check
    if (!canTransition(booking.status, newStatus)) {
        await clientDb.query("ROLLBACK");
        return (res as any).status(400).json({ message: `Invalid transition from ${booking.status} to ${newStatus}` });
    }

    // 1. UPDATE BOOKING STATUS
    await clientDb.query(`UPDATE bookings SET status=$1 WHERE id=$2`, [newStatus, bookingId]);

    // 2. AUDIT LOG
    await clientDb.query(
        `INSERT INTO booking_events (booking_id, old_status, new_status, actor_id, reason)
         VALUES ($1, $2, $3, $4, 'Provider Update')`,
        [bookingId, booking.status, newStatus, userId]
    );

    // 3. SETTLEMENT LOGIC (Atomic with Status Update)
    if (newStatus === 'COMPLETED') {
        const providerId = booking.provider_id;
        const providerAmt = Number(booking.provider_amount);
        const platformAmt = Number(booking.platform_fee);
        
        await clientDb.query(`UPDATE provider_stats SET completed_bookings = completed_bookings + 1 WHERE provider_id=$1`, [providerId]);
        
        // A. Release from Escrow Ledger (Debit Total)
        await clientDb.query(
            `INSERT INTO escrow_ledger (booking_id, amount, type, description)
             VALUES ($1, $2, 'RELEASE', 'Funds Released on Completion')`,
            [bookingId, -Number(booking.total_amount)]
        );

        // B. Recognize Platform Revenue (Credit Ledger technically, but noted separately for audit)
        await clientDb.query(
            `INSERT INTO escrow_ledger (booking_id, amount, type, description)
             VALUES ($1, $2, 'COMMISSION', 'Platform Fee Recognized')`,
            [bookingId, platformAmt]
        );

        // C. Credit Provider Wallet
        await clientDb.query(`INSERT INTO provider_wallet (provider_id) VALUES ($1) ON CONFLICT DO NOTHING`, [providerId]);
        await clientDb.query(`UPDATE provider_wallet SET balance = balance + $1 WHERE provider_id=$2`, [providerAmt, providerId]);
        
        // D. Log Wallet Transaction
        await clientDb.query(
            `INSERT INTO wallet_transactions (provider_id, amount, type, reference_id, description) 
             VALUES ($1, $2, 'CREDIT', $3, 'Booking Settlement')`, 
            [providerId, providerAmt, bookingId]
        );
        
        // E. Auto-transition to SETTLED immediately implies funds moved
        await clientDb.query(`UPDATE bookings SET status='SETTLED' WHERE id=$1`, [bookingId]);
    }
    else if (newStatus === 'CANCELLED') {
        const providerId = booking.provider_id;
        await clientDb.query(`UPDATE provider_stats SET cancelled_bookings = cancelled_bookings + 1 WHERE provider_id=$1`, [providerId]);
        await clientDb.query(`DELETE FROM slot_locks WHERE booking_id=$1`, [bookingId]);
    }

    await clientDb.query("COMMIT");
    (res as any).json({ message: "Status updated" });
  } catch (error) {
    await clientDb.query("ROLLBACK");
    next(error);
  } finally {
    clientDb.release();
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    
    let query = "";
    if (role === 'CLIENT') {
        query = `
            SELECT b.id, b.status, b.scheduled_time, b.total_amount, b.address, b.notes, b.created_at,
                   t.name as service_title,
                   u.name as provider_name,
                   CASE WHEN b.status IN ('CONFIRMED','IN_PROGRESS', 'PROVIDER_ASSIGNED') THEN u.phone ELSE NULL END as provider_phone
            FROM bookings b
            JOIN services s ON s.id = b.service_id
            JOIN service_templates t ON t.id = s.template_id
            JOIN users u ON u.id = b.provider_id
            WHERE b.client_id = $1
            ORDER BY b.scheduled_time DESC
        `;
    } else if (role === 'PROVIDER') {
        query = `
            SELECT b.id, b.status, b.scheduled_time, b.total_amount, b.address, b.notes, b.created_at,
                   t.name as service_title,
                   u.name as client_name,
                   CASE WHEN b.status IN ('CONFIRMED','IN_PROGRESS', 'PROVIDER_ASSIGNED') THEN u.phone ELSE NULL END as client_phone
            FROM bookings b
            JOIN services s ON s.id = b.service_id
            JOIN service_templates t ON t.id = s.template_id
            JOIN users u ON u.id = b.client_id
            WHERE b.provider_id = $1
            ORDER BY b.scheduled_time DESC
        `;
    }
    const result = await db.query(query, [userId]);
    (res as any).json(result.rows);
  } catch (error) {
    next(error);
  }
};
