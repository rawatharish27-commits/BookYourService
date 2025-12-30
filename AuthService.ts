
import { db } from './DatabaseService';
import { User, UserRole, UserStatus, VerificationStatus } from './types';
import { infra } from './InfraComplianceService';

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
      return { success: false, message: "Too many requests. Node cooling down." };
    }

    console.log(`[SECURE_GATEWAY] Code for ${phone}: 1234`);
    return { success: true, message: "OTP Sent." };
  }

  async verifyOtp(phone: string, otp: string, role: UserRole): Promise<{ user: User; token: string; refreshToken: string; mfaRequired?: boolean } | null> {
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
        city: 'DL',
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

    if (user.role === UserRole.ADMIN && user.mfaEnabled) {
      return { user, token: 'PRE_AUTH', refreshToken: 'PRE_AUTH', mfaRequired: true };
    }

    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const expiresAt = Date.now() + this.ACCESS_TOKEN_EXPIRY;
    const token = `JWT_${btoa(user.id + ':' + expiresAt)}`;
    const refreshToken = `REF_${Math.random().toString(36).slice(2)}`;
    
    user.lastLogin = new Date().toISOString();
    user.deviceId = this.ensureDeviceId();
    await db.upsertUser(user);
    
    this.currentUser = user;
    localStorage.setItem('DP_TOKEN', token);
    localStorage.setItem('DP_REFRESH_TOKEN', refreshToken);
    localStorage.setItem('DP_USER', JSON.stringify(user));
    
    return { user, token, refreshToken };
  }

  async rotateTokens() {
    const userStr = localStorage.getItem('DP_USER');
    const refresh = localStorage.getItem('DP_REFRESH_TOKEN');
    if (!userStr || !refresh) return null;

    const user = JSON.parse(userStr);
    console.log("[SECURITY] Rotating Refresh Token for", user.id);
    return this.issueTokens(user);
  }

  async verify2FA(code: string): Promise<boolean> {
    if (code === '9999') {
      const user = JSON.parse(localStorage.getItem('DP_USER_PENDING') || '{}');
      if (user.id) {
         await this.issueTokens(user);
         localStorage.removeItem('DP_USER_PENDING');
         return true;
      }
    }
    return false;
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
      // Check expiry
      const parts = atob(token.split('_')[1]).split(':');
      const expiry = parseInt(parts[1]);
      if (Date.now() > expiry) {
        console.warn("[SECURITY] Token Expired. Triggering Rotation.");
        // In a real app, this would be handled via an interceptor
        this.rotateTokens();
      }
      this.currentUser = JSON.parse(userStr);
      return { user: this.currentUser!, token };
    }
    return null;
  }
}

export const auth = new AuthService();
