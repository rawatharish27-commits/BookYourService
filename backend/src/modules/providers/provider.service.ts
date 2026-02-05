
import { providerRepository } from "./provider.repository";
import { db } from "../../config/db";

export const providerService = {
  async apply(userId: string, bio: string) {
    const existing = await providerRepository.findByUser(userId);
    if (existing) throw { status: 409, message: "Already applied or registered as provider" };

    const roleRes = await db.query(`SELECT id FROM roles WHERE name='PROVIDER'`);
    if(roleRes.rowCount === 0) throw { status: 500, message: "Provider role not configured" };
    
    await db.query(`UPDATE users SET role_id=$1 WHERE id=$2`, [roleRes.rows[0].id, userId]);

    return providerRepository.create(userId, bio || "");
  },

  async submitKyc(userId: string, docType: string, url: string) {
    const provider = await providerRepository.findByUser(userId);
    if (!provider) throw { status: 404, message: "Provider profile not found" };

    if (['LIVE', 'SUSPENDED', 'REJECTED'].includes(provider.approval_status)) {
      throw { status: 400, message: `Cannot submit KYC in ${provider.approval_status} state` };
    }

    await providerRepository.addKyc(provider.id, docType, url);
    
    if (provider.approval_status === 'REGISTERED') {
        await providerRepository.updateStatus(provider.id, "KYC_SUBMITTED");
        await providerRepository.logStatusChange(provider.id, 'REGISTERED', 'KYC_SUBMITTED', userId, 'KYC Uploaded');
    }
  },

  async approve(providerId: string, adminId: string) {
    const provider = await providerRepository.findById(providerId);
    if(!provider) throw { status: 404, message: "Provider not found" };

    await providerRepository.updateStatus(providerId, "APPROVED");
    await providerRepository.logStatusChange(providerId, provider.approval_status, "APPROVED", adminId, "Admin Approval");
  },

  async goLive(providerId: string, adminId: string) {
    const provider = await providerRepository.findById(providerId);
    if(!provider) throw { status: 404, message: "Provider not found" };
    
    if(provider.approval_status !== 'APPROVED') throw { status: 400, message: "Provider must be APPROVED first" };

    await providerRepository.updateStatus(providerId, "LIVE");
    await providerRepository.logStatusChange(providerId, "APPROVED", "LIVE", adminId, "Go Live Activation");
  },
  
  async getStatus(userId: string) {
      return providerRepository.findByUser(userId);
  },

  async getWallet(userId: string) {
      const wallet = await db.query(`SELECT balance FROM provider_wallet WHERE provider_id=$1`, [userId]);
      const txns = await db.query(`SELECT * FROM wallet_transactions WHERE provider_id=$1 ORDER BY created_at DESC`, [userId]);
      return {
          balance: Number(wallet.rows[0]?.balance || 0),
          transactions: txns.rows
      };
  },

  async requestGoLive(userId: string) {
      return db.transaction(async (client) => {
          const provRes = await client.query(`SELECT id, approval_status FROM providers WHERE user_id=$1 FOR UPDATE`, [userId]);
          if (provRes.rowCount === 0) throw { status: 404, message: "Provider not found" };
          const provider = provRes.rows[0];

          if (provider.approval_status === 'LIVE') throw { status: 400, message: "Already LIVE" };
          if (provider.approval_status !== 'APPROVED') throw { status: 400, message: "KYC must be APPROVED first" };

          const services = await client.query(`SELECT count(*) FROM services WHERE provider_id=$1 AND is_active=true`, [userId]);
          const availability = await client.query(`SELECT count(*) FROM provider_availability WHERE provider_id=$1`, [userId]);

          if (parseInt(services.rows[0].count) === 0) throw { status: 400, message: "Must have at least 1 active service" };
          if (parseInt(availability.rows[0].count) === 0) throw { status: 400, message: "Must set availability hours" };

          await client.query(`UPDATE providers SET approval_status='LIVE' WHERE id=$1`, [provider.id]);
          await client.query(`UPDATE users SET verification_status='LIVE' WHERE id=$1`, [userId]);

          await client.query(
            `INSERT INTO provider_status_history (provider_id, old_status, new_status, changed_by, reason) 
             VALUES ($1, 'APPROVED', 'LIVE', $2, 'Provider Go-Live Request')`,
            [provider.id, userId]
          );
      });
  }
};
