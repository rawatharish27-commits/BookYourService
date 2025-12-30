
import { User, Booking, WalletLedger, UserRole, UserStatus, VerificationStatus, AuditLog, Complaint, SystemConfig, Incident, CityConfig, Problem, AdminRole, BookingStatus, Category } from './types';
import { generateProblems, CATEGORIES } from './constants';

class DatabaseService {
  private readonly STORAGE_KEY = 'DOORSTEP_PRO_CORE_DB_V7_9';
  private db: any = {
    users: [],
    bookings: [],
    ledger: [],
    auditLogs: [],
    complaints: [],
    problems: [],
    cities: [], // Initialized to support regional configuration nodes
    config: { schemaVersion: 7.9, aiKillSwitch: false, autoMatchingEnabled: true, globalPlatformFee: 10 }
  };

  constructor() {
    this.load();
  }

  private load() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.db = JSON.parse(data);
    }
    
    // Ensure ontology is always populated at runtime if empty
    if (!this.db.problems || this.db.problems.length < 1000) {
      this.db.problems = generateProblems();
      this.save();
    }

    // Default Admin
    if (!this.db.users.some((u: any) => u.id === 'ADMIN_ROOT')) {
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
        createdAt: new Date().toISOString()
      });
      this.save();
    }
  }

  public save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.db));
  }

  getUsers(): User[] { return this.db.users; }
  getBookings(): Booking[] { return this.db.bookings; }
  getProblems(): Problem[] { return this.db.problems; }
  getLedger(): WalletLedger[] { return this.db.ledger; }
  getComplaints(): Complaint[] { return this.db.complaints || []; }
  getConfig(): SystemConfig { return this.db.config; }

  // Added updateConfig to allow AI kill-switch and global parameter adjustments
  async updateConfig(updates: Partial<SystemConfig>) {
    this.db.config = { ...this.db.config, ...updates };
    this.save();
  }

  // Added audit method used by security, infra, and quality services for forensic logging
  async audit(actorId: string, action: string, entity: string, metadata?: any, severity: string = 'INFO') {
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

  // Added atomic transaction stubs for local storage persistence consistency
  beginTransaction() { /* Logic for local persistence is atomic via save() */ }
  commit() { this.save(); }
  rollback() { this.load(); /* Simple rollback to last saved state */ }

  // Added getters for system management modules
  getCategories(): Category[] { return CATEGORIES; }
  getAuditLogs(): AuditLog[] { return this.db.auditLogs; }
  getCities(): CityConfig[] { return this.db.cities || []; }
  
  // Added createComplaint for dispute fulfillment workflows
  async createComplaint(complaint: Complaint) {
    if (!this.db.complaints) this.db.complaints = [];
    this.db.complaints.push(complaint);
    this.save();
  }

  async upsertUser(user: User) {
    const idx = this.db.users.findIndex((u: any) => u.id === user.id);
    if (idx > -1) this.db.users[idx] = user;
    else this.db.users.push(user);
    this.save();
  }

  async updateBooking(id: string, updates: Partial<Booking>) {
    const idx = this.db.bookings.findIndex((b: any) => b.id === id);
    if (idx > -1) this.db.bookings[idx] = { ...this.db.bookings[idx], ...updates };
    this.save();
  }

  async appendLedger(entry: WalletLedger) {
    this.db.ledger.push(entry);
    const user = this.db.users.find((u: any) => u.id === entry.userId);
    if (user) {
      user.walletBalance += (entry.type === 'CREDIT' ? entry.amount : -entry.amount);
    }
    this.save();
  }

  async logAction(actorId: string, action: string, entity: string, entityId: string, metadata?: any) {
    this.db.auditLogs.push({
      id: `AUDIT_${Date.now()}`,
      actorId, action, entity, entityId, metadata,
      timestamp: new Date().toISOString()
    });
    this.save();
  }
}

export const db = new DatabaseService();
