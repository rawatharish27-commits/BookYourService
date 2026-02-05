
import { Request, Response, NextFunction } from "express";
import { bookingService } from "./booking.service";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { cancellationService } from "../cancellations/cancellation.service";

export const bookingController = {
  async initiate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clientId = req.user!.id;
      const { subcategory_id, zone_id, scheduled_time, address, notes } = (req as any).body;

      if (!subcategory_id || !zone_id || !scheduled_time || !address) {
          return (res as any).status(400).json({ message: "Missing required fields" });
      }

      const booking = await bookingService.initiate({
        clientId,
        subCategoryId: subcategory_id,
        zoneId: zone_id,
        scheduledTime: scheduled_time,
        address,
        notes: notes || ""
      });

      (res as any).status(201).json({ success: true, booking, message: "Slot reserved! Proceed to payment." });
    } catch (e) {
      next(e);
    }
  },

  async accept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        await bookingService.acceptBooking((req as any).params.id, req.user!.id);
        (res as any).json({ success: true, message: "Booking Accepted" });
    } catch (e) { next(e); }
  },

  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { reason } = (req as any).body;
        await bookingService.rejectBooking((req as any).params.id, req.user!.id, reason);
        (res as any).json({ success: true, message: "Booking Rejected & Refund Initiated" });
    } catch (e) { next(e); }
  },

  async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bookingService.startJob(
        (req as any).params.id,
        req.user!.id
      );
      (res as any).json({ success: true, message: "Job Started" });
    } catch (e) {
      next(e);
    }
  },

  async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Delegates settlement to service
      // Fix: Property 'completeJob' does not exist on bookingService. Using markProviderCompleted.
      // In current Phase 5 workflow, providers mark jobs as completed, and settlement is triggered by customer confirmation.
      await bookingService.markProviderCompleted(
        (req as any).params.id,
        req.user!.id
      );
      (res as any).json({ success: true, message: "Job marked as completed. Awaiting customer confirmation." });
    } catch (e) {
      next(e);
    }
  },

  async getDetails(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          const booking = await bookingService.getDetails(
              (req as any).params.id,
              req.user!.id,
              req.user!.role
          );
          (res as any).json(booking);
      } catch (e) {
          next(e);
      }
  },

  async listMyBookings(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          const bookings = await bookingService.listMyBookings(
              req.user!.id,
              req.user!.role as 'CLIENT' | 'PROVIDER'
          );
          (res as any).json(bookings);
      } catch (e) {
          next(e);
      }
  }
};
