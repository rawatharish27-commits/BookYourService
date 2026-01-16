
// Fixed: Using default import for db service
import db from './DatabaseService';
import { User, Booking, VerificationStatus, UserStatus } from './types';

class MigrationService {
  private readonly CURRENT_VERSION = 7.5;

  async runMigrations() {
    const config = db.getConfig();
    // @ts-ignore - simulating version tracking in config
    const currentVer = config.schemaVersion || 0;

    if (currentVer < this.CURRENT_VERSION) {
      console.log(`[DATABASE] Migrating schema from v${currentVer} to v${this.CURRENT_VERSION}`);
      
      db.beginTransaction();
      try {
        if (currentVer < 7.0) {
          this.migrateToV7();
        }
        if (currentVer < 7.5) {
          this.migrateToV7_5();
        }

        // @ts-ignore
        db.updateConfig({ schemaVersion: this.CURRENT_VERSION });
        db.commit();
        console.log(`[DATABASE] Migration successful.`);
      } catch (e) {
        db.rollback();
        console.error(`[DATABASE] Migration failed:`, e);
      }
    }
  }

  private migrateToV7() {
    const users = db.getUsers();
    users.forEach(u => {
      // Ensure all users have a fraud score
      if (u.fraudScore === undefined) u.fraudScore = 0;
      // Ensure providers have a quality score
      if (u.role === 'PROVIDER' && u.qualityScore === undefined) u.qualityScore = 80;
    });
  }

  private migrateToV7_5() {
    const bookings = db.getBookings();
    bookings.forEach(b => {
      // Ensure SLA Tier is set
      if (!b.slaTier) b.slaTier = 'BRONZE' as any;
    });
  }
}

export const migrationService = new MigrationService();
