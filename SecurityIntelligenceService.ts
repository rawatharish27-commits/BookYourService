
import { AuditLogEntity, FraudSignal, FraudType, UserRole } from './types';
import { db } from './DatabaseService';

class SecurityIntelligenceService {
  
  /**
   * Image 1: Detection and Response for API Threats & Attacks
   */
  detectInjectionAttempt(input: string): boolean {
    const maliciousPatterns = [
      /<script>/i,
      /SELECT \* FROM/i,
      /DROP TABLE/i,
      /OR 1=1/i,
      /javascript:/i
    ];
    
    const isThreat = maliciousPatterns.some(pattern => pattern.test(input));
    if (isThreat) {
       console.error("[SECURITY] Malicious input detected. Blocking request.");
    }
    return isThreat;
  }

  /**
   * Image 1: Sensitive Data Flow (PII Protection)
   */
  maskPII(text: string): string {
    // Mask phone numbers and Aadhaar-like numbers in logs
    return text.replace(/(\d{4})\d{4}(\d{2})/g, '$1******$2');
  }

  /**
   * Image 1: API Interactions & Behavior Changes
   */
  async reportThreat(user_id: string, type: string, description: string, severity: AuditLogEntity['severity'] = 'ERROR') {
    await db.audit(user_id, `THREAT_${type}`, 'SecurityNode', {
      description,
      timestamp: new Date().toISOString()
    }, severity);
  }

  /**
   * Image 1: Lateral Service Breach Check
   */
  validateRoleAccess(targetRole: UserRole, currentRole: UserRole): boolean {
    if (currentRole === UserRole.ADMIN) return true;
    if (currentRole === UserRole.PROVIDER && targetRole === UserRole.USER) return true;
    
    // Prevent non-admins from hitting admin-only interactions
    return targetRole !== UserRole.ADMIN;
  }
}

export const security = new SecurityIntelligenceService();
