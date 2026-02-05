
import { Response, NextFunction } from "express";
import { db } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AdminLogModel } from "../models/adminLog.model";
import { adminService } from "../modules/admin/admin.service";
import { disputeService } from "../modules/admin/dispute.service";

export const adminController = {
  // GOD MODE OVERRIDES
  async forceCancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { id } = (req as any).params;
        const { reason } = (req as any).body;
        const result = await adminService.forceCancelBooking(id, req.user!.id, reason);
        (res as any).json(result);
    } catch (e) { next(e); }
  },

  async forceRefund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { id } = (req as any).params;
        const { reason } = (req as any).body;
        const result = await adminService.forceRefundPayment(id, req.user!.id, reason);
        (res as any).json(result);
    } catch (e) { next(e); }
  },

  // PROVIDER ACTIONS
  async suspendProvider(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { providerId } = (req as any).params;
      const { reason } = (req as any).body;
      await adminService.suspendProvider(providerId, reason, req.user!.id);
      (res as any).json({ success: true, message: "Provider suspended" });
    } catch (e) { next(e); }
  },

  async verifyProvider(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { providerId, status } = (req as any).body; 
        const adminId = req.user!.id;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return (res as any).status(400).json({ message: "Invalid status" });
        }

        await db.transaction(async (client) => {
            await client.query(`UPDATE providers SET approval_status=$1 WHERE id=$2`, [status, providerId]);
            await client.query(
                `UPDATE users SET verification_status=$1 WHERE id=(SELECT user_id FROM providers WHERE id=$2)`,
                [status, providerId]
            );
            
            // 🔒 PHASE 7 Audit
            await AdminLogModel.log(adminId, 'VERIFY_PROVIDER', 'USER', providerId, { status }, client);
        });

        (res as any).json({ message: `Provider ${status}` });
    } catch (e) { next(e); }
  },

  async payoutProvider(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const adminId = req.user!.id;
        const { providerId, amount } = (req as any).body;

        const result = await db.transaction(async (client) => {
            const walletRes = await client.query(`SELECT balance FROM provider_wallet WHERE provider_id=$1 FOR UPDATE`, [providerId]);
            if (walletRes.rowCount === 0) throw { status: 404, message: "Wallet not found" };

            if (Number(walletRes.rows[0].balance) < amount) throw { status: 400, message: "Insufficient balance" };

            const payoutRes = await client.query(`INSERT INTO payouts (provider_id, amount, status) VALUES ($1, $2, 'PROCESSED') RETURNING id`, [providerId, amount]);
            await client.query(`UPDATE provider_wallet SET balance = balance - $1 WHERE provider_id=$2`, [amount, providerId]);
            
            // 🔒 PHASE 7 Audit
            await AdminLogModel.log(adminId, 'PROCESS_PAYOUT', 'PAYMENT', payoutRes.rows[0].id, { amount, providerId }, client);

            return { payoutId: payoutRes.rows[0].id };
        });

        (res as any).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  // Fix: Added missing listDisputes method
  async listDisputes(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          const disputes = await disputeService.list();
          (res as any).json(disputes);
      } catch (e) { next(e); }
  },

  async resolveDispute(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          const { resolution, outcome, disputeId } = (req as any).body;
          const adminId = req.user!.id;
          await disputeService.resolve(disputeId, resolution, outcome, adminId);
          
          // Audit happens inside service transaction
          (res as any).json({ success: true, message: "Dispute resolved" });
      } catch (e) { next(e); }
  },

  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const result = await db.query(`
            SELECT a.*, u.name as admin_name 
            FROM admin_audit_logs a
            JOIN users u ON u.id = a.admin_id
            ORDER BY a.created_at DESC LIMIT 200
        `);
        (res as any).json(result.rows);
    } catch (e) { next(e); }
  },

  async getSystemMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const metrics = await Promise.all([
            db.query(`SELECT status, COUNT(*) FROM bookings GROUP BY status`),
            db.query(`SELECT approval_status as verification_status, COUNT(*) FROM providers GROUP BY approval_status`),
            db.query(`SELECT payment_status, COUNT(*) FROM payments GROUP BY payment_status`),
            db.query(`SELECT SUM(amount) as total_volume FROM payments WHERE payment_status='SUCCESS'`),
            db.query(`SELECT COUNT(*) as potential_fraud FROM (SELECT client_id FROM bookings WHERE status='CANCELLED' GROUP BY client_id HAVING COUNT(*) > 3) as sub`),
            db.query(`SELECT COUNT(*) as error_logs FROM admin_audit_logs WHERE action_type LIKE '%ERROR%' OR action_type LIKE '%FAIL%'`)
        ]);

        (res as any).json({
            timestamp: new Date().toISOString(),
            status: "OPERATIONAL",
            metrics: {
                bookings_by_status: metrics[0].rows,
                providers_by_status: metrics[1].rows,
                payments_by_status: metrics[2].rows,
                total_volume: Number(metrics[3].rows[0]?.total_volume || 0),
                potential_fraud_clients: Number(metrics[4].rows[0]?.potential_fraud || 0),
                system_errors_last_24h: Number(metrics[5].rows[0]?.error_logs || 0)
            }
        });
    } catch (e) { next(e); }
  },

  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const [bookings, revenue, providers] = await Promise.all([
            db.query(`SELECT status, COUNT(*) FROM bookings GROUP BY status`),
            db.query(`SELECT SUM(platform_fee) as total_revenue FROM bookings WHERE status='COMPLETED' OR status='SETTLED'`),
            db.query(`SELECT approval_status as verification_status, COUNT(*) FROM providers GROUP BY approval_status`)
        ]);

        (res as any).json({
            bookings: bookings.rows,
            revenue: revenue.rows[0].total_revenue,
            provider_stats: providers.rows
        });
    } catch (e) { next(e); }
  },

  async getProvidersWithWallet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const result = await db.query(
            `SELECT u.id, u.name, u.email, p.approval_status as verification_status, COALESCE(pw.balance, 0) as balance
             FROM providers p
             JOIN users u ON u.id = p.user_id
             LEFT JOIN provider_wallet pw ON pw.provider_id = u.id
             ORDER BY p.created_at DESC`
        );
        (res as any).json(result.rows);
    } catch (e) { next(e); }
  },

  async getSystemConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const result = await db.query(`SELECT * FROM system_configs ORDER BY key`);
        (res as any).json(result.rows);
    } catch (e) { next(e); }
  },

  async updateSystemConfig(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const adminId = req.user!.id;
        const { key, value } = (req as any).body;
        
        await db.query(
            `INSERT INTO system_configs (key, value, updated_by) VALUES ($1, $2, $3)
             ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW(), updated_by=$3`,
            [key, value, adminId]
        );
        
        // 🔒 PHASE 7 Audit
        await AdminLogModel.log(adminId, 'UPDATE_CONFIG', 'CONFIG', adminId, { key, value });

        (res as any).json({ message: "Config updated" });
    } catch (e) { next(e); }
  }
};
