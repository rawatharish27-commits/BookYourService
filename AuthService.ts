
import { db } from './DatabaseService';
import { User, UserRole, UserStatus, VerificationStatus } from './types';

class AuthService {
  private currentUser: User | null = null;

  async sendOtp(phone: string): Promise<boolean> {
    console.log(`[AUTH] OTP sent to ${phone}`);
    return true;
  }

  async verifyOtp(phone: string, otp: string, role: UserRole): Promise<{ user: User; token: string } | null> {
    if (otp !== '1234') return null;

    const users = db.getUsers();
    let user = users.find(u => u.phone === phone && u.role === role);

    if (!user) {
      user = {
        id: `U_${Date.now()}`,
        phone,
        name: `User_${phone.slice(-4)}`,
        role,
        status: role === UserRole.ADMIN ? UserStatus.ACTIVE : UserStatus.ACTIVE,
        verificationStatus: role === UserRole.PROVIDER ? VerificationStatus.REGISTERED : VerificationStatus.ACTIVE,
        city: 'DL',
        walletBalance: 0,
        fraudScore: 0,
        createdAt: new Date().toISOString()
      };
      await db.upsertUser(user);
      await db.logAction(user.id, 'REGISTER', 'User', user.id);
    }

    const token = `JWT_${btoa(user.id + ':' + Date.now())}`;
    this.currentUser = user;
    
    localStorage.setItem('DP_TOKEN', token);
    localStorage.setItem('DP_USER', JSON.stringify(user));

    return { user, token };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('DP_TOKEN');
    localStorage.removeItem('DP_USER');
  }

  getSession() {
    const userStr = localStorage.getItem('DP_USER');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      return { user: this.currentUser!, token: localStorage.getItem('DP_TOKEN')! };
    }
    return null;
  }
}

export const auth = new AuthService();
