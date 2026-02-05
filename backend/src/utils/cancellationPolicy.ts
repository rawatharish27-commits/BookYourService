
import { db } from "../config/db";

interface PenaltyResult {
    penaltyAmount: number;
    refundAmount: number;
    reason: string;
}

export const calculateCancellation = async (
    booking: { total_amount: number, scheduled_time: Date, service_id: string, category_id?: string },
    initiatedBy: 'CLIENT' | 'PROVIDER'
): Promise<PenaltyResult> => {
    
    // 1. PROVIDER CANCELLATION: Always Full Refund to Client
    if (initiatedBy === 'PROVIDER') {
        return {
            penaltyAmount: 0,
            refundAmount: Number(booking.total_amount),
            reason: 'Provider Cancelled - Full Refund'
        };
    }

    // 2. CLIENT CANCELLATION
    // Fetch policy
    let policy = { free_window_hours: 24, late_penalty_percent: 20 }; // Default
    
    if (booking.category_id) {
        const policyRes = await db.query(`SELECT * FROM cancellation_policies WHERE category_id=$1`, [booking.category_id]);
        if (policyRes.rowCount > 0) policy = policyRes.rows[0];
    } else {
        // Fallback: fetch via service -> category
        const policyRes = await db.query(
            `SELECT cp.* FROM cancellation_policies cp
             JOIN services s ON s.category_id = cp.category_id
             WHERE s.id = $1`, 
            [booking.service_id]
        );
        if (policyRes.rowCount > 0) policy = policyRes.rows[0];
    }

    const jobTime = new Date(booking.scheduled_time).getTime();
    const now = new Date().getTime();
    const hoursUntilJob = (jobTime - now) / (1000 * 60 * 60);

    // A. Free Window
    if (hoursUntilJob > policy.free_window_hours) {
        return {
            penaltyAmount: 0,
            refundAmount: Number(booking.total_amount),
            reason: 'Cancelled within free window'
        };
    }

    // B. Late Cancellation
    const penalty = Number(booking.total_amount) * (policy.late_penalty_percent / 100);
    const refund = Number(booking.total_amount) - penalty;

    return {
        penaltyAmount: Number(penalty.toFixed(2)),
        refundAmount: Number(refund.toFixed(2)),
        reason: `Late cancellation penalty (${policy.late_penalty_percent}%) applied.`
    };
};
