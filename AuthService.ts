import db from './DatabaseService';
import { User, UserRole, UserStatus, VerificationStatus } from './types';

class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = 60 * 60 * 1000;

  async verifyOtp(phone: string, otp: string, role: UserRole): Promise<{ user: User; token: string } | null> {
    if (otp !== '1234') return null;
    
    const users = db.getUsers();
    let user = users.find(u => u.phone === phone && u.role === role);

    if (!user) {
      if (role === UserRole.ADMIN) return null;
      user = {
        id: `U_${Date.now()}`,
        phone,
        name: `Node_${phone.slice(-4)}`,
        role,
        status: role === UserRole.PROVIDER ? UserStatus.PROBATION : UserStatus.ACTIVE,
        verificationStatus: role === UserRole.PROVIDER ? VerificationStatus.REGISTERED : VerificationStatus.ACTIVE,
        city: 'MUMBAI',
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

    const expiry = Date.now() + this.ACCESS_TOKEN_EXPIRY;
    const token = `JWT_${btoa(user.id + ':' + expiry)}`;
    
    user.lastLogin = new Date().toISOString();
    await db.upsertUser(user);
    
    localStorage.setItem('DP_TOKEN', token);
    localStorage.setItem('DP_USER', JSON.stringify(user));
    
    return { user, token };
  }

  getSession() {
    const userStr = localStorage.getItem('DP_USER');
    const token = localStorage.getItem('DP_TOKEN');
    if (userStr && token) {
      return { user: JSON.parse(userStr), token };
    }
    return null;
  }

  logout() {
    localStorage.clear();
  }
}

const auth = new AuthService();
export default auth;