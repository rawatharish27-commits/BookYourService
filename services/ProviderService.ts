
import { db } from './DatabaseService';
import { ProviderStatus, VerificationStatus } from '../types';

class ProviderService {
  async uploadKYC(userId: string, data: any) {
    const user = db.getUsers().find(u => u.id === userId);
    if (!user) return;
    user.verificationStatus = VerificationStatus.KYC_PENDING;
    user.kycDetails = { documentsUploaded: true, aadhaarNumber: data.aadhaar, panNumber: data.pan };
    db.save();
  }

  // Added verifyPaymentMethod to fix property missing error in ProviderModule
  async verifyPaymentMethod(userId: string, upiId: string) {
    const user = db.getUsers().find(u => u.id === userId);
    if (user && user.kycDetails) {
      user.kycDetails.upiId = upiId;
      db.save();
    }
  }

  async approveProvider(adminId: string, providerId: string) {
    const provider = db.getUsers().find(u => u.id === providerId);
    if (provider) {
      provider.verificationStatus = VerificationStatus.ACTIVE;
      db.save();
    }
  }

  async toggleAvailability(userId: string, status: ProviderStatus) {
    const user = db.getUsers().find(u => u.id === userId);
    if (user) {
      user.providerStatus = status;
      db.save();
    }
  }
}

export const providerService = new ProviderService();
