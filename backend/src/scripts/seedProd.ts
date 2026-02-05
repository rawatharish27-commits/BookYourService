import { db } from "../config/db";
import { logger } from "../utils/logger";

/**
 * 🧱 PHASE 12: PRODUCTION SEEDER & PHASE 7 DATA BACKFILL
 * Populates only static config data.
 * Fixes data consistency for legacy records.
 */
const seedProduction = async () => {
    const client = await db.connect();
    try {
        logger.info("🌱 Starting Production Seeding & Data Backfill...");
        await client.query("BEGIN");

        // 1. Roles (Immutable Source of Truth)
        await client.query(`
            INSERT INTO roles (name, description) VALUES 
            ('ADMIN', 'Platform Administrator'),
            ('CLIENT', 'Service Seeker'),
            ('PROVIDER', 'Service Professional')
            ON CONFLICT (name) DO NOTHING;
        `);
        logger.info("✅ Roles Initialized");

        // 2. Platform Safety: System Configs
        const configs = [
            ['PLATFORM_FEE_PERCENT', '10', 'Commission taken by the platform per booking'],
            ['KYC_MANDATORY', 'true', 'Providers must be verified to go live'],
            ['SLOT_LOCK_TTL_MINS', '15', 'Time a booking slot remains reserved for payment'],
            ['MAX_CONCURRENT_BOOKINGS_PER_CLIENT', '5', 'Abuse prevention limit']
        ];

        for (const [key, value, desc] of configs) {
            await client.query(
                `INSERT INTO system_configs (key, value, description) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (key) DO NOTHING`,
                [key, value, desc]
            );
        }
        logger.info("✅ System Configs Initialized");

        // 3. PHASE 7.3: DATA BACKFILL (Legacy Records)
        
        // A. Backfill Provider KYC for existing providers missing a KYC record
        await client.query(`
            INSERT INTO provider_kyc (id, provider_id, status)
            SELECT uuid_generate_v4(), id, 'PENDING'
            FROM providers
            WHERE id NOT IN (SELECT provider_id FROM provider_kyc)
        `);
        logger.info("✅ Backfilled Provider KYC Statuses");

        // B. Safety: Ensure all SUCCESS payments have matching ledger entries
        await client.query(`
            INSERT INTO escrow_ledger (id, booking_id, amount, type, description)
            SELECT uuid_generate_v4(), booking_id, amount, 'DEPOSIT', 'Legacy Backfill: Auto-generated Ledger'
            FROM payments
            WHERE payment_status = 'SUCCESS'
            AND booking_id NOT IN (SELECT booking_id FROM escrow_ledger)
        `);
        logger.info("✅ Backfilled Financial Ledger Integrity");

        await client.query("COMMIT");
        logger.info("🟢 Production Seeding & Backfill Complete.");

    } catch (e) {
        await client.query("ROLLBACK");
        logger.error("❌ Seeding/Backfill Failed", e);
        (process as any).exit(1);
    } finally {
        client.release();
        await db.end();
    }
};

seedProduction();
