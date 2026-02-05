
import { db } from "../../config/db";

export const trustService = {
  async evaluate(providerId: string) {
    // Fetch stats
    const statsRes = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE status='COMPLETED') AS completed,
        COUNT(*) FILTER (WHERE status='CANCELLED') AS cancelled,
        COUNT(*) FILTER (WHERE status='SETTLED') AS settled
       FROM bookings
       WHERE provider_id=$1`,
      [providerId]
    );

    const completed = Number(statsRes.rows[0].completed || 0);
    const settled = Number(statsRes.rows[0].settled || 0); // Settled counts as completed effectively
    const cancelled = Number(statsRes.rows[0].cancelled || 0);
    
    const totalSuccessful = completed + settled;

    // Trust Algorithm:
    // Base: 50
    // +2 per successful booking (Max +40)
    // -5 per cancellation (Uncapped mostly, but let's floor at 0)
    
    let score = 50;
    score += Math.min(totalSuccessful * 2, 40);
    score -= (cancelled * 5);

    // Rating Impact
    const ratingRes = await db.query(`SELECT avg_rating FROM provider_stats WHERE provider_id=$1`, [providerId]);
    const avgRating = Number(ratingRes.rows[0]?.avg_rating || 0);
    
    if (avgRating > 4.5) score += 10;
    if (avgRating < 3.0 && avgRating > 0) score -= 10;

    // Clamp 0 to 100
    score = Math.max(0, Math.min(100, score));

    await db.query(
        `INSERT INTO provider_stats (provider_id, trust_score) 
         VALUES ($1, $2)
         ON CONFLICT (provider_id) DO UPDATE SET trust_score=$2`,
        [providerId, score]
    );

    return score;
  },
};
