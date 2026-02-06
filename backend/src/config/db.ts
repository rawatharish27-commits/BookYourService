import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';
import { env } from "./env";
import { logger } from "../utils/logger";

/**
 * 💎 DATABASE ADAPTER 2.0: PRISMA + NEON
 * Highly optimized for serverless/edge functions with connection pooling.
 */

// 1. Setup Neon Serverless Pool
const pool = new Pool({ connectionString: env.DATABASE_URL });

// 2. Initialize Prisma with Neon Driver Adapter
const adapter = new PrismaNeon(pool);
export const db = new PrismaClient({ adapter });

// Re-export transaction helper for cleaner syntax
export const withTransaction = db.$transaction;

// Legacy compatibility and Health Checks
export const checkConnection = async () => {
    try {
        await db.$queryRaw`SELECT 1`;
        logger.info("✅ Database Connection Verified via Prisma/Neon");
    } catch (err) {
        logger.error("❌ Database Connection Failed", { error: err });
        throw err;
    }
};

// Shutdown handler
export const closeDatabase = async () => {
    await db.$disconnect();
    await pool.end();
};
