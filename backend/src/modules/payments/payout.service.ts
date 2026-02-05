import { db } from "../../config/db";
import { logger } from "../../utils/logger";

export const payoutService = {
  /**
   * 💸 PROCESS PAYOUT
   * Deducts from wallet and creates payout record in a single transaction.
   */
  async process(providerId: string, amount: number, adminId: string) {
    return db.transaction(async (client) => {
        // 1. Row Lock on Wallet
        const walletRes = await client.query(
            `SELECT balance FROM provider_wallet WHERE provider_id = $1 FOR UPDATE`,
            [providerId]
        );
        
        if (walletRes.rowCount === 0) throw { status: 404, message: "Provider wallet not found" };
        const balance = Number(walletRes.rows[0].balance);

        if (balance < amount) throw { status: 400, message: "Insufficient funds in provider wallet" };

        // 2. Create Payout Record
        const payoutRes = await client.query(
            `INSERT INTO payouts (provider_id, amount, status, period_start, period_end)
             VALUES ($1, $2, 'PROCESSED', NOW(), NOW()) RETURNING id`,
            [providerId, amount]
        );

        // 3. Deduct Balance
        await client.query(
            `UPDATE provider_wallet SET balance = balance - $1 WHERE provider_id = $2`,
            [amount, providerId]
        );

        // 4. Record Wallet Transaction
        await client.query(
            `INSERT INTO wallet_transactions (provider_id, amount, type, reference_id, description)
             VALUES ($1, $2, 'DEBIT', $3, 'Payout Processed by Admin')`,
            [providerId, -amount, payoutRes.rows[0].id]
        );

        logger.info(`Payout successful: ${payoutRes.rows[0].id} for Provider ${providerId}`);
        return payoutRes.rows[0];
    });
  }
};