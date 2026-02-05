
import { db } from "../config/db";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

const runMigration = async () => {
  const client = await db.connect();
  try {
    logger.info("🔄 Starting Database Migration (Phase 2)...");
    
    // Read the SQL file
    // Using process.cwd() to resolve path safely, avoiding __dirname issues in some TS envs
    const sqlPath = path.resolve((process as any).cwd(), "database.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    // Execute
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

    logger.info("✅ Database Schema Applied Successfully.");
    
    // Seed basic roles if they don't exist
    await client.query(`
      INSERT INTO roles (name, description) VALUES 
      ('ADMIN', 'System Administrator'),
      ('CLIENT', 'Service Seeker'),
      ('PROVIDER', 'Service Professional')
      ON CONFLICT (name) DO NOTHING;
    `);
    
    logger.info("🌱 Basic Roles Seeded.");

  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("❌ Migration Failed", { error });
    (process as any).exit(1);
  } finally {
    client.release();
    await db.end();
  }
};

runMigration();
