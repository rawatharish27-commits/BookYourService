import { reviewRepository } from "./review.repository";
import { ratingService } from "./rating.service";
import { trustService } from "./trust.service";
import { db } from "../../config/db";

export const reviewService = {
  async submit(input: {
    bookingId: string;
    clientId: string;
    providerId: string;
    rating: number;
    comment: string;
  }) {
    // 1. Validate Input
    if (input.rating < 1 || input.rating > 5) {
      throw { status: 400, message: "Invalid rating. Must be 1-5." };
    }

    // 2. Validate Eligibility
    // PHASE 6 RULE: Booking must be CLOSED (Success) or COMPLETED.
    const bookingCheck = await db.query(
        `SELECT id, status FROM bookings 
         WHERE id=$1 AND client_id=$2 AND status IN ('CLOSED', 'SETTLED', 'COMPLETED')`,
        [input.bookingId, input.clientId]
    );

    if (bookingCheck.rowCount === 0) {
      throw { status: 403, message: "Review not allowed. Service must be finished and confirmed first." };
    }

    // 3. Check Duplicate
    const exists = await reviewRepository.exists(input.bookingId);
    if (exists) {
      throw { status: 409, message: "You have already reviewed this booking." };
    }

    // 4. Create Review
    const review = await reviewRepository.create(input);

    // 5. PHASE 6: TRIGGER REPUTATION ENGINE
    await ratingService.recalculateProvider(input.providerId);
    await trustService.evaluate(input.providerId);

    return review;
  },

  async listProviderReviews(providerId: string) {
    const result = await reviewRepository.listByProvider(providerId);
    return result.rows;
  },
};