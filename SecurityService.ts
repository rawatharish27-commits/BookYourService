
// Fixed: Using default import for db service
import db from './DatabaseService';
import { UserRole } from './types';

class SecurityService {
  private readonly ADMIN_IP_ALLOWLIST = ['127.0.0.1', '192.168.1.1', '10.0.0.1'];
  private secrets: Record<string, string> = {
    'JWT_SECRET': 'ds-pro-secure-k8s-vault-001',
    'REFRESH_SECRET': 'ds-pro-rotation-node-99'
  };

  /**
   * JWT REFRESH TOKEN ROTATION (SIMULATED)
   * On every refresh, the old token is invalidated and a new pair is issued.
   */
  rotateTokens(oldRefreshToken: string): { accessToken: string; refreshToken: string } {
    console.log(`[SECURITY] Rotating token: ${oldRefreshToken.slice(0, 8)}...`);
    const newAccess = `JWT_${Math.random().toString(36).slice(2)}_${Date.now() + 900000}`;
    const newRefresh = `REF_${Math.random().toString(36).slice(2)}_${Date.now() + 604800000}`;
    return { accessToken: newAccess, refreshToken: newRefresh };
  }

  /**
   * ADMIN IP ALLOWLIST CHECK
   */
  isIpAuthorized(ip: string, role: UserRole): boolean {
    if (role !== UserRole.ADMIN) return true;
    const isAllowed = this.ADMIN_IP_ALLOWLIST.includes(ip);
    if (!isAllowed) {
      db.audit('SYSTEM', 'BLOCKED_ADMIN_IP', 'SecurityNode', { attemptedIp: ip }, 'CRITICAL');
    }
    return isAllowed;
  }

  /**
   * SECRETS ROTATION
   */
  async rotateSystemSecrets() {
    const newSecret = `ds-pro-vault-${Math.random().toString(36).slice(2, 6)}`;
    this.secrets['JWT_SECRET'] = newSecret;
    await db.audit('ADMIN_ROOT', 'SECRETS_ROTATION', 'Vault', { newKeyId: newSecret }, 'INFO');
    return true;
  }

  getSecret(key: string): string {
    return this.secrets[key] || 'UNDEFINED';
  }
}

export const securityService = new SecurityService();
