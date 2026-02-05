
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { disputeService } from "../admin/dispute.service"; // Reuse service logic but expose user actions
// Added direct import for db
import { db } from "../../config/db";

export const disputeController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId, reason } = (req as any).body;
      const initiatorId = req.user!.id;

      if (!bookingId || !reason) throw { status: 400, message: "Missing fields" };

      const dispute = await disputeService.open(bookingId, initiatorId, reason);
      (res as any).status(201).json({ success: true, dispute });
    } catch (e) {
      next(e);
    }
  },

  async getMyDisputes(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          // Note: disputeService.list() is admin only currently. 
          // We need a user-specific list function.
          // For now, implementing a quick query here or better extending service.
          // Extending service in this file for simplicity as 'admin/dispute.service' implies shared logic.
          // Fixed: Use imported db instead of require
          const result = await db.query(
              `SELECT * FROM disputes WHERE initiator_id = $1 ORDER BY created_at DESC`,
              [req.user!.id]
          );
          (res as any).json(result.rows);
      } catch (e) { next(e); }
  }
};
