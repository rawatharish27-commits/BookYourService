
import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";

export const publicController = {
  /**
   * Public Stats for Landing Page (Live Updates)
   */
  async getPublicStats(req: Request, res: Response, next: NextFunction) {
    try {
      // Parallel DB queries for performance
      const [bookings, providers, clients, services] = await Promise.all([
        db.query(`SELECT COUNT(*) FROM bookings`),
        db.query(`SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name='PROVIDER') AND verification_status='LIVE'`),
        db.query(`SELECT COUNT(*) FROM users WHERE role_id = (SELECT id FROM roles WHERE name='CLIENT')`),
        db.query(`SELECT COUNT(*) FROM services WHERE is_active=true AND is_approved=true`)
      ]);

      (res as any).json({
        total_bookings: parseInt(bookings.rows[0].count),
        active_providers: parseInt(providers.rows[0].count),
        happy_clients: parseInt(clients.rows[0].count),
        services_available: parseInt(services.rows[0].count),
        visitors_today: Math.floor(Math.random() * 500) + parseInt(bookings.rows[0].count) * 2 // Simulated visitor count based on activity logic
      });
    } catch (e) {
      next(e);
    }
  }
};
