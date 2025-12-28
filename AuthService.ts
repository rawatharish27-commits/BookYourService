
import { UserEntity, UserRole, VerificationStatus } from './types';
import { db } from './DatabaseService';

/**
 * PHASE-2: AUTHENTICATION & SECURITY SERVICE
 * Implements JWT-style session management and RBAC logic.
 * Updated to handle Multi-Step Verification states.
 */
class AuthService {
  private readonly SESSION_KEY = 'DOORSTEP_PRO_SESSION';

  async login(email: string, password: string): Promise<{ user: UserEntity; token: string } | null> {
    const allUsers = (db as any).db.users as UserEntity[];
    let user = allUsers.find(u => u.email === email);

    // Hardcoded logic for demo users if not in DB
    if (!user) {
      if (email === 'admin@doorstep.gov.in' && password === 'password123') {
        user = await db.createUser({ 
          name: 'Super Admin', 
          email: 'admin@doorstep.gov.in', 
          role_id: UserRole.ADMIN, 
          state_code: 'UP',
          verification_status: VerificationStatus.ACTIVE
        });
      } else if (email === 'rajesh@provider.com' && password === 'password123') {
        user = await db.createUser({ 
          name: 'Rajesh Kumar', 
          email: 'rajesh@provider.com', 
          role_id: UserRole.PROVIDER, 
          state_code: 'UP',
          verification_status: VerificationStatus.ACTIVE
        });
      } else if (email === 'customer@demo.in' && password === 'password123') {
        user = await db.createUser({ 
          name: 'Demo Customer', 
          email: 'customer@demo.in', 
          role_id: UserRole.USER, 
          state_code: 'DL',
          verification_status: VerificationStatus.OTP_VERIFIED
        });
      }
    }

    if (user && password === 'password123') {
      return this.createSession(user);
    }

    if (user) await (db as any).audit(user.id, 'AUTH_FAILURE', 'User', { reason: 'Invalid Password' });
    return null;
  }

  async registerWithOTP(name: string, email: string, phone: string, role: UserRole): Promise<{ user: UserEntity; token: string }> {
    const user = await db.createUser({
      name,
      email,
      phone,
      role_id: role,
      verification_status: VerificationStatus.UNVERIFIED
    });
    return this.createSession(user);
  }

  private createSession(user: UserEntity) {
    const token = `JWT_${btoa(user.id + ':' + Date.now())}`;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ user, token }));
    return { user, token };
  }

  getSession(): { user: UserEntity; token: string } | null {
    const session = localStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  async verifyRole(requiredRoles: UserRole[]): Promise<boolean> {
    const session = this.getSession();
    if (!session) return false;
    return requiredRoles.includes(session.user.role_id);
  }
}

export const auth = new AuthService();
