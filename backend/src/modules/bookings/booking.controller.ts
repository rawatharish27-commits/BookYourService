import { Request, Response, NextFunction } from "express";
import { bookingService } from "./booking.service";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { db } from "../../config/db";
import { BookingStatus } from "./booking.state";

export const bookingController = {
  async initiate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.initiate({
        clientId: req.user!.id,
        subCategoryId: (req as any).body.subcategory_id,
        zoneId: (req as any).body.zone_id,
        scheduledTime: (req as any).body.scheduled_time,
        address: (req as any).body.address,
        notes: (req as any).body.notes || ""
      });
      (res as any).status(201).json({ success: true, booking });
    } catch (e) { next(e); }
  },

  // Fix: Added accept controller method
  async accept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bookingService.accept((req as any).params.id, req.user!.id);
      (res as any).json({ success: true });
    } catch (e) { next(e); }
  },

  // Fix: Added reject controller method
  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bookingService.reject((req as any).params.id, req.user!.id, (req as any).body.reason);
      (res as any).json({ success: true });
    } catch (e) { next(e); }
  },

  // Fix: Added start controller method
  async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bookingService.start((req as any).params.id, req.user!.id);
      (res as any).json({ success: true });
    } catch (e) { next(e); }
  },

  // Fix: Added complete controller method
  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bookingService.complete((req as any).params.id, req.user!.id);
      (res as any).json({ success: true });
    } catch (e) { next(e); }
  },

  // Fix: Added listMyBookings controller method
  async listMyBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookings = await bookingService.listMyBookings(req.user!.id, req.user!.role as any);
      (res as any).json(bookings);
    } catch (e) { next(e); }
  },

  // Fix: Added getDetails controller method
  async getDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.getDetails((req as any).params.id, req.user!.id, req.user!.role);
      (res as any).json(booking);
    } catch (e) { next(e); }
  },

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    const client = await db.connect();
    try {
      const { id } = (req as any).params;
      const { reason } = (req as any).body;
      const userId = req.user!.id;

      await client.query("BEGIN");

      // 1. Fetch and Lock Booking
      const bookingRes = await client.query(`SELECT * FROM bookings WHERE id=$1 FOR UPDATE`, [id]);
      if (bookingRes.rowCount === 0) throw { status: 404, message: "Booking not found" };
      const booking = bookingRes.rows[0];

      // 2. Authorization
      if (booking.client_id !== userId && booking.provider_id !== userId && req.user!.role !== 'ADMIN') {
        throw { status: 403, message: "Unauthorized cancellation attempt" };
      }

      // 3. Log Reason
      await client.query(
        `INSERT INTO cancellation_reasons (booking_id, cancelled_by, reason) VALUES ($1, $2, $3)`,
        [id, req.user!.role, reason]
      );

      // 4. Update Status
      await client.query(`UPDATE bookings SET status='CANCELLED', updated_at=NOW() WHERE id=$1`, [id]);

      // 5. Release Locks
      await client.query(`DELETE FROM slot_locks WHERE booking_id=$1`, [id]);

      await client.query("COMMIT");
      (res as any).json({ success: true, message: "Booking cancelled and slot released" });
    } catch (e) {
      await client.query("ROLLBACK");
      next(e);
    } finally {
      client.release();
    }
  }
};