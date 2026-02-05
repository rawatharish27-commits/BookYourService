import { db } from "../../config/db";
import { reviewRepository } from "./review.repository";

/**
 * PHASE 6: REPUTATION ENGINE
 * Implements Recency-Weighted Averaging.
 */
export const ratingService = {
  async recalculateProvider(providerId: string) {
    const result = await reviewRepository.getReviewDataForCalculation(providerId);
    const reviews = result.rows;

    if (reviews.length === 0) {
        await db.query(`UPDATE provider_stats SET avg_rating=0 WHERE provider_id=$1`, [providerId]);
        return 0;
    }

    let weightedSum = 0;
    let weightTotal = 0;

    /**
     * Recency Weighting Strategy:
     * Newest reviews are more relevant to a provider's current quality.
     * We apply a multiplier based on the review index (ASC sorted).
     */
    reviews.forEach((r, idx) => {
      // Weight = 1.0 + (index * 0.05)
      // Example: For 20 reviews, the latest review has ~2x the weight of the first review.
      const weight = 1.0 + (idx * 0.05); 
      weightedSum += Number(r.rating) * weight;
      weightTotal += weight;
    });

    const finalRating = Number((weightedSum / weightTotal).toFixed(2));

    await db.query(
      `UPDATE provider_stats SET avg_rating=$1, updated_at=NOW() WHERE provider_id=$2`,
      [finalRating, providerId]
    );

    return finalRating;
  },
};