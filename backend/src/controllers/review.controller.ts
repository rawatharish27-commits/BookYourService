
import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { updateProviderTrust } from "../utils/trustScore";

/**
 * CLIENT: Add Review
 * Enforces: Completed booking, One review per booking
 */
export const addReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const client = await db.connect();
    try {
        const clientId = req.user!.id;
        const { bookingId, rating, comment } = (req as any).body;

        if (rating < 1 || rating > 5) return (res as any).status(400).json({ message: "Rating must be 1-5" });

        await client.query("BEGIN");

        // 1. Validate Booking & Eligibility
        const bookingRes = await client.query(
            `SELECT id, status, provider_id FROM bookings WHERE id=$1 AND client_id=$2`,
            [bookingId, clientId]
        );

        if (bookingRes.rowCount === 0) {
            await client.query("ROLLBACK");
            return (res as any).status(404).json({ message: "Booking not found or not yours" });
        }

        const booking = bookingRes.rows[0];

        if (booking.status !== 'COMPLETED') {
            await client.query("ROLLBACK");
            return (res as any).status(400).json({ message: "Can only review COMPLETED bookings" });
        }

        // 2. Check Duplicates
        const dupCheck = await client.query(`SELECT id FROM reviews WHERE booking_id=$1`, [bookingId]);
        if (dupCheck.rowCount > 0) {
             await client.query("ROLLBACK");
             return (res as any).status(409).json({ message: "Already reviewed" });
        }

        // 3. Insert Review
        const reviewRes = await client.query(
            `INSERT INTO reviews (booking_id, client_id, provider_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [bookingId, clientId, booking.provider_id, rating, comment]
        );

        // 4. Update Stats (Avg Rating)
        await client.query(
            `UPDATE provider_stats 
             SET avg_rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE provider_id = $1 AND visibility_status='VISIBLE')
             WHERE provider_id = $1`,
            [booking.provider_id]
        );

        await client.query("COMMIT");

        // Async Trust Score Update
        updateProviderTrust(booking.provider_id).catch(console.error);

        (res as any).json({ message: "Review submitted" });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};

/**
 * PUBLIC: Get Reviews for Service/Provider
 * Filtered by visibility
 */
export const getReviewsByService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { serviceId } = (req as any).params;
        // Logic: Get reviews for the provider who owns this service
        // (Assuming reviews are provider-bound in this schema, linked via service indirectly)
        
        const result = await db.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, r.reply_text, u.name as client_name 
             FROM reviews r
             JOIN bookings b ON b.id = r.booking_id
             JOIN users u ON u.id = r.client_id
             WHERE b.service_id = $1 AND r.visibility_status = 'VISIBLE'
             ORDER BY r.created_at DESC LIMIT 20`,
            [serviceId]
        );
        
        (res as any).json(result.rows);
    } catch (e) { next(e); }
};

/**
 * PROVIDER: Reply to Review
 */
export const replyToReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const providerId = req.user!.id;
        const { reviewId, replyText } = (req as any).body;

        const reviewRes = await db.query(
            `SELECT id FROM reviews WHERE id=$1 AND provider_id=$2`,
            [reviewId, providerId]
        );

        if (reviewRes.rowCount === 0) return (res as any).status(404).json({ message: "Review not found or not yours" });

        await db.query(
            `UPDATE reviews SET reply_text=$1, reply_at=NOW() WHERE id=$2`,
            [replyText, reviewId]
        );

        (res as any).json({ message: "Reply posted" });
    } catch (e) { next(e); }
};

/**
 * ADMIN: Get Flagged Reviews
 */
export const getFlaggedReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await db.query(
            `SELECT r.*, u.name as client_name, p.name as provider_name
             FROM reviews r
             JOIN users u ON u.id = r.client_id
             JOIN users p ON p.id = r.provider_id
             WHERE r.visibility_status = 'FLAGGED'
             ORDER BY r.created_at ASC`
        );
        (res as any).json(result.rows);
    } catch (e) { next(e); }
};

/**
 * ADMIN: Moderate Review (Hide/Restore)
 */
export const moderateReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { reviewId, action } = (req as any).body; // action: 'HIDE', 'RESTORE'
        const newStatus = action === 'HIDE' ? 'HIDDEN' : 'VISIBLE';
        
        await db.query(
            `UPDATE reviews SET visibility_status=$1 WHERE id=$2`,
            [newStatus, reviewId]
        );
        
        // Log it
        await db.query(
            `INSERT INTO admin_logs (admin_id, action, target_id, metadata) 
             VALUES ($1, 'MODERATE_REVIEW', $2, $3)`,
            [req.user!.id, reviewId, JSON.stringify({ action })]
        );

        (res as any).json({ message: `Review ${newStatus}` });
    } catch (e) { next(e); }
};
