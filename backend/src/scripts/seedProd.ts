
import { db } from "../config/db";
import { logger } from "../utils/logger";

/**
 * 🧱 PHASE 12: PRODUCTION SEEDER
 * Populates only static config data.
 * DOES NOT create mock users or fake bookings.
 */
const seedProduction = async () => {
    const client = await db.connect();
    try {
        logger.info("🌱 Seeding Static Production Data...");
        await client.query("BEGIN");

        // 1. Roles (Immutable)
        await client.query(`
            INSERT INTO roles (name, description) VALUES 
            ('ADMIN', 'Platform Administrator'),
            ('CLIENT', 'Customer'),
            ('PROVIDER', 'Service Professional')
            ON CONFLICT (name) DO NOTHING;
        `);
        logger.info("✅ Roles Seeded");

        // 2. Zones (Initial Launch Areas)
        await client.query(`
            INSERT INTO zones (name, city) VALUES 
            ('Downtown', 'New York'),
            ('Brooklyn', 'New York'),
            ('Queens', 'New York')
            ON CONFLICT DO NOTHING;
        `);
        logger.info("✅ Zones Seeded");

        // 3. Categories
        const cats = await client.query(`
            INSERT INTO categories (name, slug, description, is_active) VALUES 
            ('Home Cleaning', 'cleaning', 'Professional home cleaning services', true),
            ('Plumbing', 'plumbing', 'Expert plumbing repairs and installation', true),
            ('Electrical', 'electrical', 'Certified electricians for home needs', true)
            ON CONFLICT (slug) DO UPDATE SET is_active=true
            RETURNING id, name;
        `);
        
        // 4. Sub-Categories & Templates (Basic Catalog)
        // Note: In real prod, this might be managed via Admin Panel, but bootstrapping helps.
        // We skip detailed template seeding here to allow Admin control, 
        // or add minimal viable catalog if needed.
        
        await client.query("COMMIT");
        logger.info("✅ Production Seeding Complete. Ready for Admin Setup.");

    } catch (e) {
        await client.query("ROLLBACK");
        logger.error("❌ Seeding Failed", e);
        (process as any).exit(1);
    } finally {
        client.release();
        await db.end();
    }
};

seedProduction();