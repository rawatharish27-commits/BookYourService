
import { db } from "../../config/db";
import { adminRepository } from "./admin.repository";

// Ensure table exists
const ensureTable = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS disputes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            booking_id UUID NOT NULL REFERENCES bookings(id),
            initiator_id UUID NOT NULL REFERENCES users(id),
            reason TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, RESOLVED
            resolution TEXT,
            outcome VARCHAR(20), -- REFUND_CLIENT, PAY_PROVIDER, DISMISS
            resolved_by UUID REFERENCES users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `).catch(console.error);
};
ensureTable();

export const disputeService = {
  async open(bookingId: string, initiatorId: string, reason: string) {
    // 1. Verify Ownership
    const bookingRes = await db.query(
        `SELECT id FROM bookings WHERE id=$1 AND (client_id=$2 OR provider_id=$2)`,
        [bookingId, initiatorId]
    );
    if (bookingRes.rowCount === 0) throw { status: 403, message: "Booking not found or access denied" };

    // 2. Check existing
    const existing = await db.query(`SELECT id FROM disputes WHERE booking_id=$1 AND status='OPEN'`, [bookingId]);
    if (existing.rowCount > 0) throw { status: 409, message: "An open dispute already exists for this booking" };

    const result = await db.query(
      `INSERT INTO disputes (booking_id, initiator_id, reason, status)
       VALUES ($1, $2, $3, 'OPEN')
       RETURNING *`,
      [bookingId, initiatorId, reason]
    );
    return result.rows[0];
  },

  async resolve(
    disputeId: string,
    resolution: string,
    outcome: 'REFUND_CLIENT' | 'PAY_PROVIDER' | 'DISMISS',
    adminId: string
  ) {
    const dispute = await db.query(`SELECT booking_id FROM disputes WHERE id=$1`, [disputeId]);
    if (dispute.rowCount === 0) throw { status: 404, message: "Dispute not found" };
    
    const bookingId = dispute.rows[0].booking_id;

    await db.transaction(async (client) => {
        // 1. Update Dispute
        await client.query(
            `UPDATE disputes 
             SET status='RESOLVED', resolution=$1, outcome=$2, resolved_by=$3, updated_at=NOW()
             WHERE id=$4`,
            [resolution, outcome, adminId, disputeId]
        );

        // 2. Action based on outcome
        if (outcome === 'REFUND_CLIENT') {
             // Retrieve total amount to refund full or partial logic could be added
             const bObj = await client.query(`SELECT total_amount FROM bookings WHERE id=$1`, [bookingId]);
             const amount = Number(bObj.rows[0].total_amount);
             
             await client.query(
                `INSERT INTO escrow_ledger (booking_id, amount, type, description)
                 VALUES ($1, $2, 'REFUND', 'Dispute Resolution Refund')`,
                [bookingId, -amount]
            );
            await client.query(`UPDATE bookings SET status='REFUNDED' WHERE id=$1`, [bookingId]);
        } else if (outcome === 'PAY_PROVIDER') {
             // Release funds logic usually handled by completeJob, but force release here
             const bObj = await client.query(`SELECT provider_amount, provider_id, total_amount FROM bookings WHERE id=$1`, [bookingId]);
             const { provider_amount, provider_id, total_amount } = bObj.rows[0];

             await client.query(
                `INSERT INTO escrow_ledger (booking_id, amount, type, description)
                 VALUES ($1, $2, 'RELEASE', 'Dispute Resolution Release')`,
                [bookingId, -Number(total_amount)]
            );
            // Credit wallet
            await client.query(`INSERT INTO provider_wallet (provider_id) VALUES ($1) ON CONFLICT DO NOTHING`, [provider_id]);
            await client.query(`UPDATE provider_wallet SET balance = balance + $1 WHERE provider_id=$2`, [provider_amount, provider_id]);
            await client.query(`UPDATE bookings SET status='SETTLED' WHERE id=$1`, [bookingId]);
        }

        // 3. Log
        await client.query(
            `INSERT INTO admin_logs (admin_id, action, target_id, metadata)
             VALUES ($1, 'RESOLVE_DISPUTE', $2, $3)`,
            [adminId, disputeId, JSON.stringify({ outcome, resolution })]
        );
    });
  },
  
  async list() {
      const result = await db.query(`
        SELECT d.*, u.name as initiator_name 
        FROM disputes d
        JOIN users u ON u.id = d.initiator_id
        ORDER BY d.created_at DESC
      `);
      return result.rows;
  }
};
