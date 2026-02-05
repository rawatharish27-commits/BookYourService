
import { Request, Response, NextFunction } from "express";
import { db, withTransaction } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * APPLY: Client -> Provider (Registered)
 * Creates entry in providers table
 */
export const applyAsProvider = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { bio } = (req as any).body;

        await withTransaction(async (client) => {
            // 1. Ensure user exists
            const userCheck = await client.query(`SELECT id, role_id FROM users WHERE id=$1`, [userId]);
            if (userCheck.rowCount === 0) throw { statusCode: 404, message: "User not found" };

            // 2. Check if already provider
            const provCheck = await client.query(`SELECT id FROM providers WHERE user_id=$1`, [userId]);
            if (provCheck.rowCount > 0) throw { statusCode: 409, message: "Application already exists" };

            // 3. Create Provider Record
            const provRes = await client.query(
                `INSERT INTO providers (user_id, bio, approval_status) VALUES ($1, $2, 'REGISTERED') RETURNING id`,
                [userId, bio]
            );
            const providerId = provRes.rows[0].id;

            // 4. Update User Role to PROVIDER
            const roleRes = await client.query(`SELECT id FROM roles WHERE name='PROVIDER'`);
            if (roleRes.rowCount === 0) throw { statusCode: 500, message: "Role config missing" };
            
            await client.query(`UPDATE users SET role_id=$1, verification_status='REGISTERED' WHERE id=$2`, [roleRes.rows[0].id, userId]);

            // 5. Audit Log
            await client.query(
                `INSERT INTO provider_status_history (provider_id, new_status, changed_by, reason) 
                 VALUES ($1, 'REGISTERED', $2, 'Initial Application')`,
                [providerId, userId]
            );
        });

        (res as any).status(201).json({ message: "Application submitted. Proceed to KYC." });
    } catch (e) {
        next(e);
    }
};

/**
 * GET ONBOARDING STATUS
 */
export const getOnboardingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        
        const result = await db.query(
            `SELECT p.id, p.approval_status, p.bio,
                    (SELECT COUNT(*) FROM provider_kyc WHERE provider_id = p.id) as kyc_count,
                    (SELECT COUNT(*) FROM services WHERE provider_id = u.id) as service_count,
                    (SELECT COUNT(*) FROM provider_availability WHERE provider_id = u.id) as avail_count
             FROM providers p
             JOIN users u ON u.id = p.user_id
             WHERE p.user_id = $1`,
            [userId]
        );

        if (result.rowCount === 0) return (res as any).status(404).json({ message: "Not a provider" });
        (res as any).json(result.rows[0]);
    } catch (e) {
        next(e);
    }
};

/**
 * SUBMIT KYC DOCUMENT
 */
export const submitKYC = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { documentType, documentUrl } = (req as any).body; // Simulating URL from S3

        await withTransaction(async (client) => {
            // Get Provider ID
            const provRes = await client.query(`SELECT id, approval_status FROM providers WHERE user_id=$1`, [userId]);
            if (provRes.rowCount === 0) throw { statusCode: 404, message: "Provider profile not found" };
            const provider = provRes.rows[0];

            if (['LIVE', 'SUSPENDED', 'REJECTED'].includes(provider.approval_status)) {
                 throw { statusCode: 400, message: `Cannot submit KYC in ${provider.approval_status} state` };
            }

            // Insert KYC
            await client.query(
                `INSERT INTO provider_kyc (provider_id, document_type, document_url) VALUES ($1, $2, $3)`,
                [provider.id, documentType, documentUrl]
            );

            // Update Status to KYC_SUBMITTED if not already
            if (provider.approval_status === 'REGISTERED') {
                await client.query(`UPDATE providers SET approval_status='KYC_SUBMITTED' WHERE id=$1`, [provider.id]);
                await client.query(`UPDATE users SET verification_status='KYC_SUBMITTED' WHERE id=$1`, [userId]);
                
                await client.query(
                    `INSERT INTO provider_status_history (provider_id, old_status, new_status, changed_by, reason) 
                     VALUES ($1, 'REGISTERED', 'KYC_SUBMITTED', $2, 'KYC Uploaded')`,
                    [provider.id, userId]
                );
            }
        });

        (res as any).json({ message: "Document uploaded" });
    } catch (e) {
        next(e);
    }
};

/**
 * REQUEST GO LIVE
 * Checks checklist: KYC Approved, Service Added, Availability Set
 */
export const requestGoLive = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        
        await withTransaction(async (client) => {
             const provRes = await client.query(`SELECT id, approval_status FROM providers WHERE user_id=$1 FOR UPDATE`, [userId]);
             if (provRes.rowCount === 0) throw { statusCode: 404, message: "Provider not found" };
             const provider = provRes.rows[0];

             if (provider.approval_status === 'LIVE') throw { statusCode: 400, message: "Already LIVE" };
             if (provider.approval_status !== 'APPROVED') throw { statusCode: 400, message: "KYC must be APPROVED first" };

             // CHECKS
             const services = await client.query(`SELECT count(*) FROM services WHERE provider_id=$1 AND is_active=true`, [userId]);
             const availability = await client.query(`SELECT count(*) FROM provider_availability WHERE provider_id=$1`, [userId]);

             if (parseInt(services.rows[0].count) === 0) throw { statusCode: 400, message: "Must have at least 1 active service" };
             if (parseInt(availability.rows[0].count) === 0) throw { statusCode: 400, message: "Must set availability hours" };

             // GO LIVE
             await client.query(`UPDATE providers SET approval_status='LIVE' WHERE id=$1`, [provider.id]);
             await client.query(`UPDATE users SET verification_status='LIVE' WHERE id=$1`, [userId]);

             await client.query(
                `INSERT INTO provider_status_history (provider_id, old_status, new_status, changed_by, reason) 
                 VALUES ($1, 'APPROVED', 'LIVE', $2, 'Provider Go-Live Request')`,
                [provider.id, userId]
             );
        });

        (res as any).json({ message: "You are now LIVE! Clients can see your services." });
    } catch (e) {
        next(e);
    }
};

/**
 * EXISTING METHODS (Re-exporting to maintain compatibility if used elsewhere)
 */
export const getAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const result = await db.query(
            `SELECT day_of_week, start_time, end_time FROM provider_availability WHERE provider_id=$1 ORDER BY day_of_week, start_time`, 
            [userId]
        );
        (res as any).json(result.rows);
    } catch (e) { next(e); }
};

export const setAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { dayOfWeek, startTime, endTime, available } = (req as any).body;
        if (available) {
            await db.query(
                `INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                [userId, dayOfWeek, startTime, endTime]
            );
        } else {
            await db.query(
                `DELETE FROM provider_availability WHERE provider_id=$1 AND day_of_week=$2 AND start_time=$3::time`,
                [userId, dayOfWeek, startTime]
            );
        }
        (res as any).json({ message: "Updated" });
    } catch (e) { next(e); }
};

export const getWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const wallet = await db.query(`SELECT balance FROM provider_wallet WHERE provider_id=$1`, [userId]);
        const txns = await db.query(`SELECT * FROM wallet_transactions WHERE provider_id=$1 ORDER BY created_at DESC`, [userId]);
        (res as any).json({
            balance: Number(wallet.rows[0]?.balance || 0),
            transactions: txns.rows
        });
    } catch (e) { next(e); }
};
