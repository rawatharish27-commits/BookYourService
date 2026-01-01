
// Fixed: Using default import for db service
import db from './DatabaseService';
import { User, ProviderStatus, VerificationStatus, LedgerType, Penalty } from './types';

class ProviderService {
  /**
   * 2. KYC Upload with OCR Simulation & Storage
   */
  async uploadKYC(userId: string, data: { aadhaar: string; pan: string }) {
    const user = db.getUsers().find(u => u.id === userId);
    if (!user) return null;

    // Simulate OCR Extraction Node
    await db.logAction(userId, 'OCR_SCAN_START', 'User', userId);
    
    // Mocking 2s processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulation: "Storing" documents in the JSON store
    const updated: User = {
      ...user,
      verificationStatus: VerificationStatus.KYC_PENDING,
      kycDetails: {
        aadhaarNumber: data.aadhaar,
        panNumber: data.pan,
        documentsUploaded: true,
        // In a real app, these would be S3/GCS signed URLs
        bankAccountNumber: `ACC_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      }
    };

    await db.upsertUser(updated);
    await db.logAction(userId, 'KYC_DOCUMENT_STORED', 'User', userId, { 
      aadhaar_masked: `XXXX-XXXX-${data.aadhaar.slice(-4)}`,
      ocr_confidence: 0.99 
    });
    
    return updated;
  }

  /**
   * 4. Bank / UPI Verification Node
   */
  async verifyPaymentMethod(userId: string, upiId: string) {
    const user = db.getUsers().find(u => u.id === userId);
    if (!user || user.verificationStatus !== VerificationStatus.KYC_PENDING) {
      throw new Error("Invalid State: KYC must be pending before payment verification.");
    }

    // Penny drop simulation
    await db.logAction(userId, 'PAYMENT_NODE_CHALLENGE', 'User', userId);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updated: User = {
      ...user,
      verificationStatus: VerificationStatus.ADMIN_APPROVED,
      kycDetails: {
        ...user.kycDetails!,
        upiId,
      }
    };

    await db.upsertUser(updated);
    await db.logAction(userId, 'BANK_VERIFIED', 'User', userId, { upi: upiId });
    return updated;
  }

  /**
   * 5. Admin Final Audit & Unlock
   */
  async approveProvider(adminId: string, providerId: string) {
    const provider = db.getUsers().find(u => u.id === providerId);
    if (!provider) return false;

    db.beginTransaction();
    try {
      provider.verificationStatus = VerificationStatus.ACTIVE;
      provider.providerStatus = ProviderStatus.OFFLINE; 
      provider.status = 'ACTIVE' as any;
      
      await db.upsertUser(provider);
      await db.logAction(adminId, 'ADMIN_FINAL_APPROVAL', 'User', providerId, {
        timestamp: new Date().toISOString(),
        auditorId: adminId
      });
      
      db.commit();
      return true;
    } catch (e) {
      db.rollback();
      return false;
    }
  }

  async toggleAvailability(userId: string, status: ProviderStatus) {
    const provider = db.getUsers().find(u => u.id === userId);
    if (!provider || provider.verificationStatus !== VerificationStatus.ACTIVE) {
      throw new Error("Security Violation: Non-verified provider attempted to go online.");
    }

    provider.providerStatus = status;
    await db.upsertUser(provider);
    await db.logAction(userId, 'PRESENCE_TOGGLE', 'User', userId, { status });
    return true;
  }

  async applyPenalty(providerId: string, amount: number, reason: string, bookingId?: string) {
    const provider = db.getUsers().find(u => u.id === providerId);
    if (!provider) return false;

    const penalty: Penalty = {
      id: `PNL_${Date.now()}`,
      providerId,
      amount,
      reason,
      bookingId,
      timestamp: new Date().toISOString()
    };

    await db.appendLedger({
      id: `L_${Date.now()}_PNL`,
      userId: providerId,
      bookingId,
      amount: amount,
      type: LedgerType.DEBIT,
      category: 'PENALTY',
      timestamp: new Date().toISOString()
    });

    await db.logAction('SYSTEM', 'PENALTY_ENFORCED', 'User', providerId, penalty);
    return true;
  }
}

export const providerService = new ProviderService();
