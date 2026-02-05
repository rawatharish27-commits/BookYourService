
import { Request, Response, NextFunction } from "express";
import { reviewService } from "./review.service";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { db } from "../../config/db";

export const reviewController = {
  async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clientId = req.user!.id;
      const { bookingId, rating, comment } = (req as any).body;

      // Fetch providerId from booking to ensure integrity
      const bookingRes = await db.query(`SELECT provider_id FROM bookings WHERE id=$1`, [bookingId]);
      if (bookingRes.rowCount === 0) throw { status: 404, message: "Booking not found" };
      const providerId = bookingRes.rows[0].provider_id;

      const review = await reviewService.submit({
        bookingId,
        clientId,
        providerId,
        rating,
        comment,
      });

      (res as any).status(201).json({ success: true, review, message: "Review submitted successfully" });
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewService.listProviderReviews((req as any).params.providerId);
      (res as any).json(reviews);
    } catch (e) {
      next(e);
    }
  },
};
