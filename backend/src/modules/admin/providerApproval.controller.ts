import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { providerService } from "../providers/provider.service";
import { db } from "../../config/db";

export const providerApprovalController = {
  async listPending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await db.query(
        `SELECT p.id, u.name, u.email, k.status as kyc_status, p.created_at 
         FROM providers p
         JOIN users u ON u.id = p.user_id
         JOIN provider_kyc k ON k.provider_id = p.id
         WHERE k.status = 'UNDER_REVIEW' OR k.status = 'PENDING'
         ORDER BY p.created_at ASC`
      );
      (res as any).json(result.rows);
    } catch (e) { next(e); }
  },

  async getDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = (req as any).params;
      const provider = await db.query(`SELECT * FROM providers WHERE id=$1`, [id]);
      const docs = await db.query(`SELECT * FROM provider_documents WHERE provider_id=$1`, [id]);
      (res as any).json({ provider: provider.rows[0], documents: docs.rows });
    } catch (e) { next(e); }
  },

  async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = (req as any).params;
      const { remarks } = (req as any).body;
      await providerService.adminApproveKyc(id, req.user!.id, remarks || "Approved by Admin");
      (res as any).json({ success: true, message: "Provider KYC Approved" });
    } catch (e) { next(e); }
  }
};