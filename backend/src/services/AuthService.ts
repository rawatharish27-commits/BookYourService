import { db } from './DatabaseService';
import { User, UserRole, UserStatus, VerificationStatus } from '../../../frontend/src/types';

class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000;

  async verifyOtp(phone: string, otp: string, role: UserRole) {
    if (otp !== '1234') return null;
    
    let user = db.getUsers().find(u => u.phone === phone && u.role === role);

    if (!user) {
      if (role === UserRole.ADMIN) return null;
      user = {
        id: `U_${Date.now()}`,
        phone,
        name: `User_${phone.slice(-4)}`,
        role,
        status: role === UserRole.PROVIDER ? UserStatus.PROBATION : UserStatus.ACTIVE,
        verificationStatus: role === UserRole.PROVIDER ? VerificationStatus.REGISTERED : VerificationStatus.ACTIVE,
        city: 'DELHI',
        walletBalance: 0,
        fraudScore: 0,
        abuseScore: 0,
        qualityScore: role === UserRole.PROVIDER ? 80 : 0,
        isProbation: role === UserRole.PROVIDER,
        jobCount: 0,
        createdAt: new Date().toISOString()
      };
      await db.upsertUser(user);
    }
    return { user, token: `JWT_${btoa(user.id)}` };
  }

  getSession() {
    const user = localStorage.getItem('DP_USER');
    const token = localStorage.getItem('DP_TOKEN');
    return (user && token) ? { user: JSON.parse(user), token } : null;
  }
}

export const auth = new AuthService();