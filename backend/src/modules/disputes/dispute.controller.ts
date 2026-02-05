import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { db } from "../../config/db";

export const disputeController = {
  async raise(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId, reason } = (req as any).body;
      const result = await db.query(
        `INSERT INTO disputes (booking_id, raised_by_user_id, reason, status)
         VALUES ($1, $2, $3, 'OPEN') RETURNING id`,
        [bookingId, req.user!.id, reason]
      );
      (res as any).status(201).json({ success: true, disputeId: result.rows[0].id });
    } catch (e) { next(e); }
  },

  // Fix: Added create alias for raise method
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    return this.raise(req, res, next);
  },

  // Fix: Added getMyDisputes method
  async getMyDisputes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await db.query(
        `SELECT d.*, b.scheduled_time 
         FROM disputes d
         JOIN bookings b ON b.id = d.booking_id
         WHERE d.raised_by_user_id = $1`,
        [req.user!.id]
      );
      (res as any).json(result.rows);
    } catch (e) { next(e); }
  },

  async listForAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await db.query(
        `SELECT d.*, u.name as reporter_name, b.status as booking_status
         FROM disputes d
         JOIN users u ON u.id = d.raised_by_user_id
         JOIN bookings b ON b.id = d.booking_id
         WHERE d.status = 'OPEN' ORDER BY d.created_at ASC`
      );
      (res as any).json(result.rows);
    } catch (e) { next(e); }
  },

  async resolve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = (req as any).params;
      const { resolution } = (req as any).body;
      await db.query(
        `UPDATE disputes SET status='RESOLVED', resolution=$1, resolved_at=NOW() WHERE id=$2`,
        [resolution, id]
      );
      (res as any).json({ success: true, message: "Dispute marked as resolved" });
    } catch (e) { next(e); }
  }
};