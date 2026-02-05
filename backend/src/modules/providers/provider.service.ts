import { providerRepository } from "./provider.repository";
import { db } from "../../config/db";

export const providerService = {
  async apply(userId: string, bio: string) {
    const existing = await providerRepository.findByUser(userId);
    if (existing) throw { status: 409, message: "Already applied or registered as provider" };

    const roleRes = await db.query(`SELECT id FROM roles WHERE name='PROVIDER'`);
    if(roleRes.rowCount === 0) throw { status: 500, message: "Provider role not configured" };
    
    return db.transaction(async (client) => {
        await client.query(`UPDATE users SET role_id=$1, verification_status='REGISTERED' WHERE id=$2`, [roleRes.rows[0].id, userId]);
        const provider = await providerRepository.create(userId, bio || "");
        
        // Initialize KYC record
        await client.query(`INSERT INTO provider_kyc (provider_id, status) VALUES ($1, 'PENDING')`, [provider.id]);
        return provider;
    });
  },

  // Fix: Renamed submitKycDoc to submitKyc to resolve controller error
  async submitKyc(userId: string, type: string, url: string) {
    const provider = await providerRepository.findByUser(userId);
    if (!provider) throw { status: 404, message: "Provider profile not found" };

    await db.transaction(async (client) => {
        // 1. Add Document
        await client.query(
            `INSERT INTO provider_documents (provider_id, document_type, document_url) VALUES ($1, $2, $3)`,
            [provider.id, type, url]
        );
        // 2. Update KYC status if it was pending
        await client.query(
            `UPDATE provider_kyc SET status='UNDER_REVIEW' WHERE provider_id=$1 AND status='PENDING'`,
            [provider.id]
        );
    });
  },

  // Fix: Added getStatus method
  async getStatus(userId: string) {
    const provider = await providerRepository.findByUser(userId);
    if (!provider) return null;
    const kyc = await db.query(`SELECT status FROM provider_kyc WHERE provider_id=$1`, [provider.id]);
    return { ...provider, kyc_status: kyc.rows[0]?.status };
  },

  // Fix: Added requestGoLive method
  async requestGoLive(userId: string) {
    const provider = await providerRepository.findByUser(userId);
    if (!provider) throw { status: 404, message: "Provider not found" };
    
    // Logic to check if all requirements met
    await providerRepository.updateStatus(provider.id, 'LIVE');
  },

  // Fix: Added getWallet method
  async getWallet(userId: string) {
    const wallet = await db.query(`SELECT balance FROM provider_wallet WHERE provider_id=$1`, [userId]);
    const txns = await db.query(`SELECT * FROM wallet_transactions WHERE provider_id=$1 ORDER BY created_at DESC LIMIT 50`, [userId]);
    return { balance: Number(wallet.rows[0]?.balance || 0), transactions: txns.rows };
  },

  // Fix: Added approve method
  async approve(providerId: string, adminId: string) {
    await providerRepository.updateStatus(providerId, 'APPROVED');
    await providerRepository.logStatusChange(providerId, null, 'APPROVED', adminId, "Admin Manual Approval");
  },

  // Fix: Added goLive method
  async goLive(providerId: string, adminId: string) {
    await providerRepository.updateStatus(providerId, 'LIVE');
    await providerRepository.logStatusChange(providerId, null, 'LIVE', adminId, "Admin Manual Go-Live");
  },

  async getDocuments(userId: string) {
    const provider = await providerRepository.findByUser(userId);
    if (!provider) throw { status: 404, message: "Provider not found" };
    const res = await db.query(`SELECT * FROM provider_documents WHERE provider_id=$1`, [provider.id]);
    return res.rows;
  },

  async adminApproveKyc(providerId: string, adminId: string, remarks: string) {
    await db.transaction(async (client) => {
        await client.query(
            `UPDATE provider_kyc SET status='APPROVED', verified_at=NOW(), verified_by_admin_id=$2, remarks=$3 
             WHERE provider_id=$1`,
            [providerId, adminId, remarks]
        );
        await client.query(
            `UPDATE providers SET approval_status='APPROVED' WHERE id=$1`,
            [providerId]
        );
        // Sync user status
        await client.query(
            `UPDATE users SET verification_status='APPROVED' WHERE id=(SELECT user_id FROM providers WHERE id=$1)`,
            [providerId]
        );
    });
  }
};