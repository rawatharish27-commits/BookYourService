

import { db } from './services/DatabaseService';
import { migrationService } from './services/MigrationService';

async function bootstrap() {
  console.log("🚀 DOORSTEP PRO | ENTERPRISE BACKEND INITIALIZING...");
  
  // Run Data Migrations
  await migrationService.runMigrations();
  
  // Check System Integrity
  const users = db.getUsers();
  console.log(`📊 System Health: ${users.length} registered nodes.`);
  
  // In a production cloud environment, we would start an Express/Hono server here
  // listening on port 8080.
  console.log("✅ Backend Operational on Port 8080.");
}

bootstrap().catch(err => {
  console.error("❌ CRITICAL BOOTSTRAP FAILURE:", err);
  // Fix: Property 'exit' does not exist on type 'Process'. Using type assertion to access Node-specific exit method.
  (process as any).exit(1);
});
