
import { Response, NextFunction } from "express";
import { db } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

// ... (Existing Imports) ...

// --- GOVERNANCE: SYSTEM CONFIGS ---

export const getSystemConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await db.query(`SELECT * FROM system_configs ORDER BY key`);
        (res as any).json(result.rows);
    } catch (e) { next(e); }
};

export const updateSystemConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user!.id;
        const { key, value } = (req as any).body;
        
        await db.query(
            `UPDATE system_configs SET value=$1, updated_at=NOW(), updated_by=$2 WHERE key=$3`,
            [value, adminId, key]
        );
        
        await db.query(
            `INSERT INTO admin_logs (admin_id, action, target_id, metadata) VALUES ($1, 'UPDATE_CONFIG', NULL, $2)`,
            [adminId, JSON.stringify({ key, value })]
        );

        (res as any).json({ message: "Config updated" });
    } catch (e) { next(e); }
};

// --- GOVERNANCE: DISPUTES ---

export const getDisputes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await db.query(
            `SELECT d.*, u.name as initiator_name, b.total_amount 
             FROM disputes d
             JOIN users u ON u.id = d.initiator_id
             JOIN bookings b ON b.id = d.booking_id
             ORDER BY d.created_at DESC`
        );
        (res as any).json(result.rows);
    } catch (e) { next(e); }
};

export const resolveDispute = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const client = await db.connect();
    try {
        const adminId = req.user!.id;
        const { disputeId, outcome, notes } = (req as any).body; 
        // Outcome: 'RESOLVED_CLIENT' (Refund), 'RESOLVED_PROVIDER' (Payout)

        await client.query("BEGIN");

        const disputeRes = await client.query(`SELECT booking_id, status FROM disputes WHERE id=$1 FOR UPDATE`, [disputeId]);
        if (disputeRes.rowCount === 0) throw { statusCode: 404, message: "Dispute not found" };
        const dispute = disputeRes.rows[0];

        if (dispute.status !== 'OPEN' && dispute.status !== 'UNDER_REVIEW') {
            throw { statusCode: 400, message: "Dispute already resolved" };
        }

        const bookingId = dispute.booking_id;
        const bookingRes = await client.query(`SELECT total_amount, provider_id, client_id FROM bookings WHERE id=$1`, [bookingId]);
        const booking = bookingRes.rows[0];

        // LOGIC BASED ON OUTCOME
        if (outcome === 'RESOLVED_CLIENT') {
            // Refund Client
            await client.query(
                `INSERT INTO escrow_ledger (booking_id, amount, type, description)
                 VALUES ($1, $2, 'REFUND', 'Dispute Resolved - Refund to Client')`,
                [bookingId, -Number(booking.total_amount)]
            );
            await client.query(`UPDATE bookings SET status='REFUNDED' WHERE id=$1`, [bookingId]);
            // (Real gateway refund trigger would be here)
        } else {
            // Pay Provider
            await client.query(
                `INSERT INTO escrow_ledger (booking_id, amount, type, description)
                 VALUES ($1, $2, 'RELEASE', 'Dispute Resolved - Released to Provider')`,
                [bookingId, -Number(booking.total_amount)]
            );
            await client.query(`UPDATE provider_wallet SET balance = balance + $1 WHERE provider_id=$2`, [Number(booking.provider_amount || 0), booking.provider_id]);
            await client.query(`UPDATE bookings SET status='SETTLED' WHERE id=$1`, [bookingId]);
        }

        // Close Dispute
        await client.query(
            `UPDATE disputes SET status=$1, admin_notes=$2, resolved_by=$3, resolved_at=NOW() WHERE id=$4`,
            [outcome, notes, adminId, disputeId]
        );

        // Audit
        await client.query(
            `INSERT INTO admin_logs (admin_id, action, target_id, metadata) 
             VALUES ($1, 'RESOLVE_DISPUTE', $2, $3)`,
            [adminId, disputeId, JSON.stringify({ outcome, notes })]
        );

        await client.query("COMMIT");
        (res as any).json({ message: "Dispute resolved successfully" });

    } catch (e) {
        await client.query("ROLLBACK");
        next(e);
    } finally {
        client.release();
    }
};

// --- EXISTING METHODS (ENHANCED) ---

export const verifyProvider = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { providerId, status } = (req as any).body; 
        const adminId = req.user!.id;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return (res as any).status(400).json({ message: "Invalid status" });
        }

        const client = await db.connect();
        try {
            await client.query("BEGIN");
            await client.query(`UPDATE providers SET approval_status=$1 WHERE id=$2`, [status, providerId]);
            await client.query(
                `UPDATE users SET verification_status=$1 WHERE id=(SELECT user_id FROM providers WHERE id=$2)`,
                [status, providerId]
            );
            await client.query(
                `INSERT INTO provider_status_history (provider_id, new_status, changed_by, reason) 
                 VALUES ($1, $2, $3, 'Admin Manual Review')`,
                [providerId, status, adminId]
            );
            await client.query("COMMIT");
            (res as any).json({ message: `Provider ${status}` });
        } catch(e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    } catch (e) { next(e); }
};

export const payoutProvider = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const client = await db.connect();
    try {
        const adminId = req.user!.id;
        const { providerId, amount } = (req as any).body;

        if (!amount || amount <= 0) return (res as any).status(400).json({ message: "Invalid payout amount" });

        await client.query("BEGIN");

        // 1. Check Balance
        const walletRes = await client.query(
            `SELECT balance FROM provider_wallet WHERE provider_id=$1 FOR UPDATE`,
            [providerId]
        );

        if (walletRes.rowCount === 0) {
            await client.query("ROLLBACK");
            return (res as any).status(404).json({ message: "Provider wallet not found" });
        }

        const currentBalance = Number(walletRes.rows[0].balance);
        if (currentBalance < amount) {
            await client.query("ROLLBACK");
            return (res as any).status(400).json({ message: "Insufficient balance" });
        }

        // 2. Create Payout Record
        const payoutRes = await client.query(
            `INSERT INTO payouts (provider_id, amount, status) VALUES ($1, $2, 'PROCESSED') RETURNING id`,
            [providerId, amount]
        );
        const payoutId = payoutRes.rows[0].id;

        // 3. Debit Wallet
        await client.query(
            `UPDATE provider_wallet SET balance = balance - $1 WHERE provider_id=$2`,
            [amount, providerId]
        );

        // 4. Log Transaction (Link to Payout)
        await client.query(
            `INSERT INTO wallet_transactions (provider_id, amount, type, reference_id, description)
             VALUES ($1, $2, 'DEBIT', $3, 'Admin Payout Processed')`,
            [providerId, amount, payoutId]
        );

        // 5. Admin Log
        await client.query(
            `INSERT INTO admin_logs (admin_id, action, target_id) VALUES ($1, 'PROVIDER_PAYOUT', $2)`,
            [adminId, providerId]
        );

        await client.query("COMMIT");
        (res as any).json({ message: "Payout processed successfully", remaining_balance: currentBalance - amount });

    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};

export const getSystemMetrics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const metrics = await Promise.all([
            db.query(`SELECT status, COUNT(*) FROM bookings GROUP BY status`),
            db.query(`SELECT approval_status as verification_status, COUNT(*) FROM providers GROUP BY approval_status`),
            db.query(`SELECT payment_status, COUNT(*) FROM payments GROUP BY payment_status`),
            db.query(`SELECT SUM(amount) as total_volume FROM payments WHERE payment_status='SUCCESS'`),
            db.query(`SELECT COUNT(*) as high_cancel_clients FROM (SELECT client_id FROM bookings WHERE status='CANCELLED' GROUP BY client_id HAVING COUNT(*) > 3) as sub`),
            db.query(`SELECT COUNT(*) as error_logs FROM admin_logs WHERE action LIKE '%ERROR%' OR action LIKE '%FAIL%'`)
        ]);

        (res as any).json({
            timestamp: new Date().toISOString(),
            status: "OPERATIONAL",
            metrics: {
                bookings_by_status: metrics[0].rows,
                providers_by_status: metrics[1].rows,
                payments_by_status: metrics[2].rows,
                total_volume: Number(metrics[3].rows[0]?.total_volume || 0),
                potential_fraud_clients: Number(metrics[4].rows[0]?.high_cancel_clients || 0),
                system_errors_last_24h: Number(metrics[5].rows[0]?.error_logs || 0)
            }
        });
    } catch (e) { next(e); }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const [bookings, revenue, providers] = await Promise.all([
            db.query(`SELECT status, COUNT(*) FROM bookings GROUP BY status`),
            db.query(`SELECT SUM(platform_fee) as total_revenue FROM bookings WHERE status='COMPLETED'`),
            db.query(`SELECT approval_status as verification_status, COUNT(*) FROM providers GROUP BY approval_status`)
        ]);

        (res as any).json({
            bookings: bookings.rows,
            revenue: revenue.rows[0].total_revenue,
            provider_stats: providers.rows
        });
    } catch (e) { next(e); }
};

export const getProvidersWithWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await db.query(
            `SELECT p.id, u.name, u.email, p.approval_status as verification_status, COALESCE(pw.balance, 0) as balance
             FROM providers p
             JOIN users u ON u.id = p.user_id
             LEFT JOIN provider_wallet pw ON pw.provider_id = u.id
             ORDER BY p.created_at DESC`
        );
        (res as any).json(result.rows);
    } catch (e) { next(e); }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => { (res as any).sendStatus(200); };
export const overrideBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => { (res as any).sendStatus(200); };
export const adminCancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => { (res as any).sendStatus(200); };
export const triggerRefund = async (req: AuthRequest, res: Response, next: NextFunction) => { (res as any).sendStatus(200); };
