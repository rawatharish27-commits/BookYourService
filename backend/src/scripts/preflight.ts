
import { db } from "../config/db";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/**
 * 🧱 PHASE 12: PRE-FLIGHT CHECK
 * Validates critical infrastructure before application startup.
 */
const runChecks = async () => {
    logger.info("🚀 STARTING PRODUCTION PRE-FLIGHT CHECKS...");
    let failed = false;

    // 1. Environment Check
    if (env.NODE_ENV !== 'production') {
        logger.warn("⚠️  NODE_ENV is not 'production'. Ensure this is intentional.");
    } else {
        logger.info("✅ NODE_ENV is production");
    }

    // 2. Secret Strength Check
    if (env.JWT_SECRET.length < 32 || env.JWT_SECRET === 'supersecret_access_key_change_me_in_prod') {
        logger.error("❌ JWT_SECRET is weak or default. ROTATE IMMEDIATELY.");
        failed = true;
    } else {
        logger.info("✅ JWT_SECRET strength OK");
    }

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        logger.warn("⚠️  Razorpay Keys missing. Payments will fail.");
    }

    // 3. Database Connectivity
    try {
        const res = await db.query('SELECT NOW()');
        logger.info(`✅ Database Connected: ${res.rows[0].now}`);
    } catch (e) {
        logger.error("❌ Database Connection FAILED", e);
        failed = true;
    }

    // 4. Critical Tables Check
    try {
        await db.query('SELECT count(*) FROM roles');
        await db.query('SELECT count(*) FROM users');
        await db.query('SELECT count(*) FROM bookings');
        logger.info("✅ Core Schema Tables Detected");
    } catch (e) {
        logger.error("❌ Database Schema Incomplete. Run migrations.", e);
        failed = true;
    }

    if (failed) {
        logger.error("🛑 PRE-FLIGHT CHECK FAILED. FIX CRITICAL ISSUES BEFORE LAUNCH.");
        (process as any).exit(1);
    } else {
        logger.info("🟢 SYSTEM READY FOR LAUNCH.");
        (process as any).exit(0);
    }
};

runChecks();