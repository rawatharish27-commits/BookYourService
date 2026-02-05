
import { db } from "../config/db";

/**
 * TRUST SCORE ENGINE
 * Base: 50
 * +1 per completed booking (Max +30)
 * +2 per 5-star review
 * -5 per cancellation
 * -10 per confirmed fraud/report
 */
export const updateProviderTrust = async (providerId: string) => {
    // Fetch stats
    const statsRes = await db.query(
        `SELECT completed_bookings, cancelled_bookings, avg_rating 
         FROM provider_stats WHERE provider_id=$1`,
        [providerId]
    );
    
    if (statsRes.rowCount === 0) return;
    const stats = statsRes.rows[0];

    const reviewStats = await db.query(
        `SELECT COUNT(*) as five_star FROM reviews WHERE provider_id=$1 AND rating=5`,
        [providerId]
    );
    const fiveStarCount = parseInt(reviewStats.rows[0].five_star);

    let score = 50; // Base

    // Positive
    score += Math.min(parseInt(stats.completed_bookings) * 1, 30); // Max +30 for volume
    score += fiveStarCount * 2; // +2 for excellence

    // Negative
    score -= parseInt(stats.cancelled_bookings) * 5;
    
    // Penalize low rating
    if (Number(stats.avg_rating) > 0 && Number(stats.avg_rating) < 4.0) {
        score -= (4.0 - Number(stats.avg_rating)) * 10;
    }

    // Clamp 0-100
    score = Math.max(0, Math.min(100, score));

    await db.query(`UPDATE provider_stats SET trust_score=$1 WHERE provider_id=$2`, [score, providerId]);
};
