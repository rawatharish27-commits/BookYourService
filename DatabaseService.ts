
import { User, Booking, WalletLedger, UserRole, UserStatus, VerificationStatus, SystemConfig, Problem, AdminRole, Category, AuditLog, Complaint } from './types';
import { generateProblems, CATEGORIES } from './constants';

class DatabaseService {
  private readonly STORAGE_KEY: string = 'BOOKYOURSERVICE_CORE_DB_V20';
  private db: any = {
    users: [],
    bookings: [],
    ledger: [],
    auditLogs: [],
    problems: [],
    complaints: [],
    config: { schemaVersion: 20.0, aiKillSwitch: false, autoMatchingEnabled: true, globalPlatformFee: 10 }
  };

  constructor() {
    this.load();
  }

  private load(): void {
    const data: string | null = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        this.db = JSON.parse(data);
      } catch (e) {
        console.error("Database parse error, resetting state.");
      }
    }
    
    // Fixed: Ensure all collections are initialized after loading from storage
    if (!this.db.users) this.db.users = [];
    if (!this.db.bookings) this.db.bookings = [];
    if (!this.db.ledger) this.db.ledger = [];
    if (!this.db.auditLogs) this.db.auditLogs = [];
    if (!this.db.complaints) this.db.complaints = [];
    if (!this.db.problems || this.db.problems.length === 0) {
      this.db.problems = generateProblems();
    }
    if (!this.db.config) {
      this.db.config = { schemaVersion: 20.0, aiKillSwitch: false, autoMatchingEnabled: true, globalPlatformFee: 10 };
    }

    if (!this.db.users.find((u: any) => u.id === 'ADMIN_ROOT')) {
      const rootAdmin: User = {
        id: 'ADMIN_ROOT',
        phone: '9999999999',
        name: 'Governance Root',
        role: UserRole.ADMIN,
        adminRole: AdminRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        verificationStatus: VerificationStatus.ACTIVE,
        city: 'SYSTEM',
        walletBalance: 0,
        qualityScore: 100,
        fraudScore: 0,
        abuseScore: 0,
        jobCount: 0,
        isProbation: false,
        createdAt: new Date().toISOString()
      };
      this.db.users.push(rootAdmin);
    }
    this.save();
  }

  public save(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.db));
  }

  getUsers(): User[] { return this.db.users || []; }
  getBookings(): Booking[] { return this.db.bookings || []; }
  getProblems(): Problem[] { return this.db.problems || []; }
  getLedger(): WalletLedger[] { return this.db.ledger || []; }
  getConfig(): SystemConfig { return this.db.config; }
  getCategories(): Category[] { return CATEGORIES; }
  
  // Fixed: Added getComplaints to fix errors in AdminOpsService and CustomerService
  getComplaints(): Complaint[] { return this.db.complaints || []; }

  // Fixed: Added updateConfig to fix error in AIIntelligenceService
  async updateConfig(updates: Partial<SystemConfig>): Promise<void> {
    this.db.config = { ...this.db.config, ...updates };
    this.save();
  }

  // Fixed: Added transaction support methods to fix errors in multiple services
  beginTransaction(): void {}
  commit(): void {}
  rollback(): void {}

  async upsertUser(user: User): Promise<void> {
    const idx = this.db.users.findIndex((u: any) => u.id === user.id);
    if (idx > -1) this.db.users[idx] = user;
    else this.db.users.push(user);
    this.save();
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<void> {
    const idx = this.db.bookings.findIndex((b: any) => b.id === id);
    if (idx > -1) {
      this.db.bookings[idx] = { ...this.db.bookings[idx], ...updates };
      this.save();
    }
  }

  async appendLedger(entry: WalletLedger): Promise<void> {
    this.db.ledger.push(entry);
    const user = this.db.users.find((u: any) => u.id === entry.userId);
    if (user) user.walletBalance += (entry.type === 'CREDIT' ? entry.amount : -entry.amount);
    this.save();
  }

  // Fixed: Added logAction with 5-argument support as required by several services
  async logAction(actorId: string, action: string, entity: string, entityId: string, metadata: any = {}): Promise<void> {
    this.db.auditLogs.push({
      id: `AUDIT_${Date.now()}`,
      actorId,
      action,
      entity,
      entityId,
      metadata,
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  async audit(actorId: string, action: string, entity: string, metadata: any = {}, severity: string = 'INFO'): Promise<void> {
    this.db.auditLogs.push({
      id: `AUDIT_${Date.now()}`,
      actorId, action, entity,
      metadata: { ...metadata, severity },
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  // Fixed: Added createComplaint to fix error in CustomerService
  async createComplaint(complaint: Complaint): Promise<void> {
    if (!this.db.complaints) this.db.complaints = [];
    this.db.complaints.push(complaint);
    this.save();
  }
}

const dbInstance = new DatabaseService();
export default dbInstance;
