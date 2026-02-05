import { db } from "../../config/db";
import { logger } from "../../utils/logger";

export const refundService = {
  async initiate(paymentId: string, amount: number, reason: string) {
    return db.transaction(async (client) => {
        // 1. Log Refund Intent
        const refundRes = await client.query(
            `INSERT INTO refunds (payment_id, amount, status, reason)
             VALUES ($1, $2, 'INITIATED', $3) RETURNING id`,
            [paymentId, amount, reason]
        );
        
        // 2. Update Ledger
        await client.query(
            `INSERT INTO escrow_ledger (booking_id, amount, type, description)
             SELECT booking_id, $2, 'REFUND', $3 FROM payments WHERE id=$1`,
            [paymentId, -amount, `Refund Initiated: ${reason}`]
        );

        logger.info(`Refund ${refundRes.rows[0].id} initiated for payment ${paymentId}`);
        return refundRes.rows[0];
    });
  },

  async handleWebhook(payload: any) {
    const { refund_id, status } = payload;
    // Map gateway status to internal status
    await db.query(`UPDATE refunds SET status=$1, processed_at=NOW() WHERE id=$2`, [status, refund_id]);
  }
};