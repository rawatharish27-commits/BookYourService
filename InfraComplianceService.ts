
import { db } from './DatabaseService';

interface DeploymentRevision {
  id: string;
  timestamp: string;
  status: 'STABLE' | 'DEPRECATED' | 'FAILED';
  traffic: number;
}

class InfraComplianceService {
  private requestLog: Record<string, number[]> = {};
  private readonly LIMIT = 100;
  private readonly WINDOW = 60000;
  private revisions: DeploymentRevision[] = [
    { id: 'v7.8.0', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'DEPRECATED', traffic: 0 },
    { id: 'v7.8.1', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'STABLE', traffic: 100 }
  ];

  checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    if (!this.requestLog[identifier]) this.requestLog[identifier] = [];
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
      version: this.revisions.find(r => r.status === 'STABLE')?.id || 'UNKNOWN',
      infra: {
        cloudRun: 'HEALTHY',
        cloudSql: 'CONNECTED',
        secretsManager: 'SYNCED',
        cdn: 'ACTIVE',
        latency: Math.floor(Math.random() * 20) + 15 + 'ms'
      },
      lastDeployment: this.revisions[this.revisions.length - 1].timestamp
    };
  }

  getRevisions() {
    return this.revisions;
  }

  async triggerRollback(revisionId: string) {
    db.audit('ADMIN_ROOT', 'GCP_ROLLBACK_INITIATED', 'Infrastructure', { revisionId }, 'CRITICAL');
    
    // Simulate traffic shifting
    this.revisions = this.revisions.map(r => ({
      ...r,
      status: r.id === revisionId ? 'STABLE' : 'DEPRECATED',
      traffic: r.id === revisionId ? 100 : 0
    }));

    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  async simulateDeployment() {
    const newVersion = `v7.8.${this.revisions.length + 1}`;
    this.revisions.push({
      id: newVersion,
      timestamp: new Date().toISOString(),
      status: 'STABLE',
      traffic: 100
    });
    
    // Deprecate others
    this.revisions = this.revisions.map(r => 
      r.id === newVersion ? r : { ...r, status: 'DEPRECATED', traffic: 0 }
    );

    db.audit('SYSTEM', 'NEW_DEPLOYMENT_SUCCESS', 'CloudBuild', { version: newVersion }, 'INFO');
  }
}

export const infra = new InfraComplianceService();
