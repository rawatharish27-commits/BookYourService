
import { UserEntity, ServiceRequestEntity, AuditLogEntity, UserRole, BookingStatus, VerificationStatus, Booking, LedgerEntry } from './types';
import { security } from './SecurityIntelligenceService';

class DatabaseService {
  private readonly STORAGE_KEY = 'DOORSTEP_PRO_V20_DB';

  public db: {
    users: UserEntity[];
    requests: ServiceRequestEntity[];
    auditLogs: AuditLogEntity[];
    ledger: LedgerEntry[];
    platform_revenue: number;
    sys_config: {
      platformFee: number;
      maintenanceMode: boolean;
      version: string;
    }
  } = {
    users: [],
    requests: [],
    auditLogs: [],
    ledger: [],
    platform_revenue: 0,
    sys_config: {
      platformFee: 10,
      maintenanceMode: false,
      version: '2.0.0-Security-Hardened'
    }
  };

  constructor() {
    this.load();
    setInterval(() => this.runSLAWorker(), 60000);
  }

  private load() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.db = JSON.parse(data);
    } else {
      this.db.users.push({
        id: 'ADMIN_001',
        name: 'Super Admin',
        email: 'admin@doorstep.pro',
        phone: '9999999999',
        role_id: UserRole.ADMIN,
        state_code: 'DL',
        is_active: true,
        wallet_balance: 0,
        trust_score: 100,
        created_at: new Date().toISOString(),
        verification_status: VerificationStatus.ACTIVE
      });
      this.save();
    }
  }

  public save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.db));
  }

  /**
   * Image 1: Security Audit Log with PII Masking
   */
  async audit(user_id: string, action: string, entity: string, metadata: any = {}, severity: AuditLogEntity['severity'] = 'INFO') {
    const log: AuditLogEntity = { 
      id: `LOG_${Date.now()}`, 
      user_id, 
      action: security.maskPII(action), 
      entity, 
      timestamp: new Date().toISOString(), 
      ip_address: '127.0.0.1', 
      metadata: JSON.stringify(metadata), 
      severity 
    };
    this.db.auditLogs.unshift(log);
    this.save();
  }

  async createLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'timestamp'>) {
    const newEntry: LedgerEntry = {
      id: `TXN_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.db.ledger.unshift(newEntry);
    this.save();
  }

  async createUser(user: Partial<UserEntity>): Promise<UserEntity> {
    const newUser: UserEntity = { 
      id: `U_${Date.now()}`, 
      name: user.name || 'User', 
      email: user.email || '', 
      phone: user.phone || '', 
      role_id: user.role_id || UserRole.USER, 
      state_code: user.state_code || 'DL', 
      is_active: true, 
      wallet_balance: 0, 
      trust_score: 100, 
      created_at: new Date().toISOString(), 
      verification_status: user.verification_status || VerificationStatus.UNVERIFIED,
      completed_jobs_count: 0
    };
    this.db.users.push(newUser);
    this.save();
    return newUser;
  }

  async createRequest(booking: Booking): Promise<void> {
    this.db.requests.unshift(booking);
    this.save();
    await this.audit(booking.user_id, 'BOOKING_CREATED', 'Request', { id: booking.id });
  }

  async updateRequest(id: string, updates: Partial<ServiceRequestEntity>): Promise<void> {
    const index = this.db.requests.findIndex(r => r.id === id);
    if (index === -1) return;

    const oldStatus = this.db.requests[index].status;
    this.db.requests[index] = { ...this.db.requests[index], ...updates };
    
    if (updates.status === BookingStatus.COMPLETED && oldStatus !== BookingStatus.COMPLETED) {
      const req = this.db.requests[index];
      const fee = this.db.sys_config.platformFee;
      const payout = req.total_amount - fee;

      const pIdx = this.db.users.findIndex(u => u.id === req.provider_id);
      if (pIdx !== -1) {
        this.db.users[pIdx].wallet_balance += payout;
        this.db.users[pIdx].completed_jobs_count = (this.db.users[pIdx].completed_jobs_count || 0) + 1;
        
        await this.createLedgerEntry({
          type: 'CREDIT',
          amount: payout,
          category: 'SERVICE_PAYOUT',
          referenceId: req.id,
          metadata: { providerId: req.provider_id }
        });

        await this.createLedgerEntry({
          type: 'CREDIT',
          amount: fee,
          category: 'PLATFORM_FEE',
          referenceId: req.id,
          metadata: { providerId: req.provider_id }
        });

        this.db.platform_revenue += fee;
      }
    }
    this.save();
  }

  private runSLAWorker() {
    const now = new Date();
    this.db.requests.forEach(req => {
      if (req.status === BookingStatus.CREATED) {
        const diff = (now.getTime() - new Date(req.created_at).getTime()) / 60000;
        if (diff > 15 && !req.isSlaBreached) {
          req.isSlaBreached = true;
          this.audit('SYSTEM', 'SLA_BREACH_ALERT', 'Request', { id: req.id }, 'WARNING');
        }
      }
    });
    this.save();
  }

  async getRequests() { return this.db.requests; }
  async getLedger() { return this.db.ledger; }
  async getUsers() { return this.db.users; }
  async getLogs() { return this.db.auditLogs; }
}

export const db = new DatabaseService();
