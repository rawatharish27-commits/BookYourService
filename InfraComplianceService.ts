
import { db } from './DatabaseService';

class InfraComplianceService {
  private requestLog: Record<string, number[]> = {};
  private readonly LIMIT = 100; // 100 requests
  private readonly WINDOW = 60000; // per 1 minute

  /**
   * SLIDING WINDOW RATE LIMITER
   */
  checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    if (!this.requestLog[identifier]) this.requestLog[identifier] = [];
    
    // Filter out requests outside the current window
    this.requestLog[identifier] = this.requestLog[identifier].filter(ts => ts > now - this.WINDOW);
    
    if (this.requestLog[identifier].length >= this.LIMIT) {
      db.audit('SYSTEM', 'RATE_LIMIT_HIT', 'Gateway', { identifier }, 'WARNING');
      return false;
    }
    
    this.requestLog[identifier].push(now);
    return true;
  }

  getDeploymentStatus() {
    return {
      service: 'doorstep-pro-app',
      region: 'us-central1',
      version: 'v7.8.2-stable',
      infra: {
        cloudRun: 'HEALTHY',
        cloudSql: 'CONNECTED',
        secretsManager: 'SYNCED',
        cdn: 'ACTIVE'
      },
      lastDeployment: new Date().toISOString()
    };
  }
}

export const infra = new InfraComplianceService();
