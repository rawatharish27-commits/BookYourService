
import { db } from './DatabaseService';
import { User, UserRole, UserStatus, VerificationStatus } from '../types';
import { infra } from '../../services/InfraComplianceService';

class AuthService {
  private currentUser: User | null = null;
  private readonly ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 mins

  constructor() {
    this.ensureDeviceId();
  }

  private ensureDeviceId() {
    let deviceId = localStorage.getItem('DP_DEVICE_ID');
    if (!deviceId) {
      deviceId = `DEV_${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
      localStorage.setItem('DP_DEVICE_ID', deviceId);
    }
    return deviceId;
  }

  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    const deviceId = this.ensureDeviceId();
    if (!infra.checkRateLimit(deviceId)) {
      return { success: false, message: "Security Node: Rate limit exceeded. Try in 60s." };
    }
    console.log(`[PROD_GATEWAY] Secure OTP for ${phone}: 1234`);
    return { success: true, message: "OTP Sent." };
  }

  async verifyOtp(phone: string, otp: string, role: UserRole): Promise<{ user: User; token: string; refreshToken: string } | null> {
    if (otp !== '1234') return null;
    
    const users = db.getUsers();
    let user = users.find(u => u.phone === phone && u.role === role);

    if (!user) {
      if (role === UserRole.ADMIN) return null;
      user = {
        id: `U_${Date.now()}`,
        phone,
        name: `User_${phone.slice(-4)}`,
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
        createdAt: new Date().toISOString(),
        deviceId: this.ensureDeviceId()
      };
      await db.upsertUser(user);
    }

    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const expiresAt = Date.now() + this.ACCESS_TOKEN_EXPIRY;
    const token = `JWT_${btoa(user.id + ':' + expiresAt)}`;
    const refreshToken = `REF_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    
    user.lastLogin = new Date().toISOString();
    await db.upsertUser(user);
    
    this.currentUser = user;
    localStorage.setItem('DP_TOKEN', token);
    localStorage.setItem('DP_REFRESH_TOKEN', refreshToken);
    localStorage.setItem('DP_USER', JSON.stringify(user));
    
    return { user, token, refreshToken };
  }

  async rotateTokens() {
    const userStr = localStorage.getItem('DP_USER');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return this.issueTokens(user);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('DP_TOKEN');
    localStorage.removeItem('DP_REFRESH_TOKEN');
    localStorage.removeItem('DP_USER');
  }

  getSession() {
    const userStr = localStorage.getItem('DP_USER');
    const token = localStorage.getItem('DP_TOKEN');
    if (userStr && token) {
      this.currentUser = JSON.parse(userStr);
      return { user: this.currentUser!, token };
    }
    return null;
  }
}

export const auth = new AuthService();
