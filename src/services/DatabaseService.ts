
import { User, Booking, WalletLedger, UserRole, UserStatus, VerificationStatus, SystemConfig, Problem, AdminRole, Category, AuditLog, Complaint, CityConfig } from '../types';
import { generateProblems, CATEGORIES } from '../../constants';

class DatabaseService {
  private readonly STORAGE_KEY = 'BOOKYOURSERVICE_CORE_DB_V12';
  private db: any = {
    users: [],
    bookings: [],
    ledger: [],
    auditLogs: [],
    problems: [],
    complaints: [],
    config: { schemaVersion: 12.0, aiKillSwitch: false, autoMatchingEnabled: true, globalPlatformFee: 10 }
  };

  constructor() {
    this.load();
  }

  private load() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) this.db = JSON.parse(data);
    
    // Core Ontology Integrity Check
    if (!this.db.problems || this.db.problems.length < 1000) {
      this.db.problems = generateProblems();
      this.save();
    }

    // Provisioning Super Admin Governance Root
    if (!this.db.users.find((u: any) => u.id === 'ADMIN_ROOT')) {
      this.db.users.push({
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
      });
      this.save();
    }
  }

  public save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.db));
  }

  getUsers(): User[] { return this.db.users || []; }
  getBookings(): Booking[] { return this.db.bookings || []; }
  getProblems(): Problem[] { return this.db.problems || []; }
  getLedger(): WalletLedger[] { return this.db.ledger || []; }
  getConfig(): SystemConfig { return this.db.config; }
  getCategories(): Category[] { return CATEGORIES; }
  getComplaints(): Complaint[] { return this.db.complaints || []; }
  getAuditLogs(): AuditLog[] { return this.db.auditLogs || []; }

  // Added getCities for AdminModule telemetry data
  getCities(): CityConfig[] {
    return [
      { code: 'MUM', name: 'Mumbai', isEnabled: true, platformFee: 10, minProviderBalance: 500 },
      { code: 'DL', name: 'Delhi', isEnabled: true, platformFee: 10, minProviderBalance: 500 },
      { code: 'GGN', name: 'Gurgaon', isEnabled: true, platformFee: 10, minProviderBalance: 500 },
    ];
  }

  // Added updateConfig to sync global system settings
  updateConfig(updates: Partial<SystemConfig>) {
    this.db.config = { ...this.db.config, ...updates };
    this.save();
  }

  // Transaction support stubs
  beginTransaction() {}
  commit() {}
  rollback() {}

  async upsertUser(user: User) {
    const idx = this.db.users.findIndex((u: any) => u.id === user.id);
    if (idx > -1) this.db.users[idx] = user;
    else this.db.users.push(user);
    this.save();
  }

  async updateBooking(id: string, updates: Partial<Booking>) {
    const idx = this.db.bookings.findIndex((b: any) => b.id === id);
    if (idx > -1) {
      this.db.bookings[idx] = { ...this.db.bookings[idx], ...updates };
      this.save();
    }
  }

  async appendLedger(entry: WalletLedger) {
    if (!this.db.ledger) this.db.ledger = [];
    this.db.ledger.push(entry);
    const user = this.db.users.find((u: any) => u.id === entry.userId);
    if (user) user.walletBalance += (entry.type === 'CREDIT' ? entry.amount : -entry.amount);
    this.save();
  }

  // Added logAction to match 5-argument service calls
  async logAction(actorId: string, action: string, entity: string, entityId: string, metadata: any = {}) {
    if (!this.db.auditLogs) this.db.auditLogs = [];
    this.db.auditLogs.push({
      id: `AUDIT_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      actorId,
      action,
      entity,
      entityId,
      metadata,
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  // Audit method with support for severity levels
  async audit(actorId: string, action: string, entity: string, metadata?: any, severity: string = 'INFO') {
    if (!this.db.auditLogs) this.db.auditLogs = [];
    this.db.auditLogs.push({
      id: `AUDIT_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      actorId, 
      action, 
      entity,
      entityId: 'SYSTEM',
      metadata: { ...metadata, severity },
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  // Added createComplaint for customer support filing
  async createComplaint(complaint: Complaint) {
    if (!this.db.complaints) this.db.complaints = [];
    this.db.complaints.push(complaint);
    this.save();
  }
}

export const db = new DatabaseService();
