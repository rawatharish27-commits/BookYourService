
import { UserEntity, UserRole, VerificationStatus } from './types';
import { db } from './DatabaseService';

class AuthService {
  private readonly SESSION_KEY = 'DOORSTEP_PRO_SESSION_V4';
  private pendingAuthPhone: string | null = null;
  private pendingAuthRole: UserRole = UserRole.USER;
  
  // Image 1: Security - IP Allowlisting simulation for Admin nodes
  private readonly ADMIN_IP_ALLOWLIST = ['127.0.0.1', '192.168.1.1'];

  async initiateOTP(phone: string, role: UserRole = UserRole.USER): Promise<{ success: boolean }> {
    this.pendingAuthPhone = phone;
    this.pendingAuthRole = role;
    // Image 2 - Step 1 & 2: User enters phone/role, initiates request
    console.log(`[AUTH-API] Secure OTP 1234 sent to ${phone}`);
    return { success: true };
  }

  /**
   * Image 2: Steps 3, 4, 5 - Verify OTP & Generate JWT Token
   */
  async verifyOTP(otp: string, userData?: { name: string; city: string; legal_consent_accepted?: boolean }): Promise<{ user: UserEntity; token: string } | null> {
    if (!this.pendingAuthPhone || otp !== '1234') {
      await db.audit('SYSTEM', 'AUTH_FAILED', 'Auth', { phone: this.pendingAuthPhone }, 'WARNING');
      return null;
    }

    const currentIp = '127.0.0.1';
    
    // Image 1: Lateral Service Breach Prevention
    if (this.pendingAuthRole === UserRole.ADMIN && !this.ADMIN_IP_ALLOWLIST.includes(currentIp)) {
      await db.audit('SYSTEM', 'UNAUTHORIZED_ADMIN_IP_PROBE', 'Auth', { ip: currentIp }, 'CRITICAL');
      return null;
    }

    const allUsers = await db.getUsers();
    let user = allUsers.find(u => u.phone === this.pendingAuthPhone);

    const deviceFingerprint = `FINGERPRINT_${navigator.userAgent.length}`;

    if (!user) {
      if (this.pendingAuthRole === UserRole.ADMIN) return null;
      
      user = await db.createUser({
        name: userData?.name || 'Guest User',
        phone: this.pendingAuthPhone,
        role_id: this.pendingAuthRole,
        state_code: userData?.city || 'DL',
        verification_status: VerificationStatus.OTP_VERIFIED,
        is_active: true,
        deviceId: deviceFingerprint,
        last_ip: currentIp,
        legal_consent_accepted: true
      });
      await db.audit(user.id, 'USER_REGISTERED', 'Auth', { deviceId: deviceFingerprint });
    }

    // Image 2 - Step 3: Generate Token
    const session = this.createSession(user);
    
    // Image 2 - Step 4 & 5: Return JWT & Grant access
    await db.audit(user.id, 'LOGIN_SUCCESS_JWT_ISSUED', 'Auth', { ip: currentIp });
    this.pendingAuthPhone = null;
    return session;
  }

  /**
   * Image 2 - Step 3: Token Generation Logic (Mock JWT)
   */
  private createSession(user: UserEntity) {
    const expiration = Date.now() + 3600000; // 1 hour
    const token = `JWT_${btoa(user.id + ':' + expiration)}`;
    const session = { user, token };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return session;
  }

  /**
   * Image 2 - Step 7: Send JWT token on every request check
   */
  getSession(): { user: UserEntity; token: string } | null {
    const s = localStorage.getItem(this.SESSION_KEY);
    if (!s) return null;
    
    const session = JSON.parse(s);
    const tokenParts = atob(session.token.split('_')[1]).split(':');
    
    // Token Expiration Security
    if (Date.now() > parseInt(tokenParts[1])) {
      console.warn("[AUTH] JWT Token Expired - Re-authentication required");
      this.logout();
      return null;
    }
    
    return session;
  }

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }
}

export const auth = new AuthService();
