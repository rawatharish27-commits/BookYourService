
import { User, Booking, WalletLedger, UserRole, UserStatus, VerificationStatus, AuditLog, Complaint, SystemConfig, Incident, CityConfig, Problem, AdminRole, BookingStatus, Category } from './types';
import { generateProblems, CATEGORIES } from './constants';

class DatabaseService {
  private readonly STORAGE_KEY = 'DOORSTEP_PRO_CORE_DB_V7_5';
  private transactionStaging: any = null;

  private db: {
    users: User[];
    bookings: Booking[];
    ledger: WalletLedger[];
    auditLogs: AuditLog[];
    complaints: Complaint[];
    incidents: Incident[];
    cities: CityConfig[];
    categories: Category[];
    problems: Problem[];
    config: SystemConfig;
  } = {
    users: [],
    bookings: [],
    ledger: [],
    auditLogs: [],
    complaints: [],
    incidents: [],
    cities: [
      { code: 'DL', name: 'Delhi Node', isEnabled: true, platformFee: 10, minProviderBalance: 50 },
      { code: 'MUM', name: 'Mumbai Node', isEnabled: true, platformFee: 15, minProviderBalance: 100 },
      { code: 'BLR', name: 'Bangalore Node', isEnabled: true, platformFee: 12, minProviderBalance: 75 }
    ],
    categories: [],
    problems: [],
    config: {
      aiKillSwitch: false,
      autoMatchingEnabled: true,
      globalPlatformFee: 10,
      // @ts-ignore
      schemaVersion: 7.5
    }
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.db = JSON.parse(data);
        if (!this.db.problems || this.db.problems.length < 1000) {
          this.initializeOntology();
        }
      } else {
        this.initializeDefaults();
      }
    } catch (e) {
      this.initializeDefaults();
    }
  }

  private initializeOntology() {
    console.log("[DATABASE] Generating massive ontology (2000+ nodes)...");
    this.db.problems = generateProblems();
    this.db.categories = CATEGORIES.map(c => ({ ...c, isEnabled: true }));
    this.save();
  }

  private initializeDefaults() {
    this.initializeOntology();
    
    const hasAdmin = this.db.users.some(u => u.id === 'ADMIN_ROOT');
    if (!hasAdmin) {
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
        fraudScore: 0,
        abuseScore: 0,
        qualityScore: 100,
        isProbation: false,
        jobCount: 0,
        createdAt: new Date().toISOString(),
        mfaEnabled: true
      });
    }
    this.save();
  }

  beginTransaction() {
    if (this.transactionStaging) throw new Error("Atomic transaction in progress.");
    this.transactionStaging = JSON.parse(JSON.stringify(this.db));
  }

  commit() {
    if (!this.transactionStaging) throw new Error("No staged transaction.");
    this.db = this.transactionStaging;
    this.transactionStaging = null;
    this.save();
  }

  rollback() {
    this.transactionStaging = null;
  }

  private get workingDb() {
    return this.transactionStaging || this.db;
  }

  public save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.db));
    } catch (e) {
      console.warn("Storage quota exceeded. Using memory-only mode.");
    }
  }

  getUsers() { return this.workingDb.users; }
  getBookings() { return this.workingDb.bookings; }
  getLedger() { return this.workingDb.ledger; }
  getAuditLogs() { return this.workingDb.auditLogs; }
  getComplaints() { return this.workingDb.complaints || []; }
  getProblems() { return this.workingDb.problems || []; }
  getCategories() { return this.workingDb.categories || []; }
  getCities() { return this.workingDb.cities || []; }
  getConfig() { return this.workingDb.config; }

  // Fix: Added missing updateConfig method to satisfy calls from AIIntelligenceService and MigrationService
  async updateConfig(updates: Partial<SystemConfig>) {
    this.workingDb.config = { ...this.workingDb.config, ...updates };
    if (!this.transactionStaging) this.save();
  }

  // Fix: Added missing createComplaint method to satisfy calls from CustomerService
  async createComplaint(complaint: Complaint) {
    if (!this.workingDb.complaints) {
      this.workingDb.complaints = [];
    }
    this.workingDb.complaints.push(complaint);
    if (!this.transactionStaging) this.save();
  }

  async upsertUser(user: User) {
    const idx = this.workingDb.users.findIndex((u: any) => u.id === user.id);
    if (idx > -1) this.workingDb.users[idx] = user;
    else this.workingDb.users.push(user);
    if (!this.transactionStaging) this.save();
  }

  async updateBooking(id: string, updates: Partial<Booking>) {
    const idx = this.workingDb.bookings.findIndex((b: any) => b.id === id);
    if (idx === -1) throw new Error(`Booking ${id} not found.`);
    this.workingDb.bookings[idx] = { ...this.workingDb.bookings[idx], ...updates };
    if (!this.transactionStaging) this.save();
  }

  async appendLedger(entry: WalletLedger) {
    this.workingDb.ledger.push(entry);
    const user = this.workingDb.users.find((u: any) => u.id === entry.userId);
    if (user) {
      user.walletBalance += (entry.type === 'CREDIT' ? entry.amount : -entry.amount);
    }
    if (!this.transactionStaging) this.save();
  }

  async logAction(actorId: string, action: string, entity: string, entityId: string, metadata?: any) {
    const log: AuditLog = {
      id: `AUDIT_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      actorId,
      action,
      entity,
      entityId,
      metadata,
      timestamp: new Date().toISOString(),
    };
    this.workingDb.auditLogs.push(log);
    if (!this.transactionStaging) this.save();
  }

  async audit(actorId: string, action: string, entity: string, metadata?: any, severity: string = 'INFO') {
    return this.logAction(actorId, action, entity, 'SYSTEM', { ...metadata, severity });
  }
}

export const db = new DatabaseService();
