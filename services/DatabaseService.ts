
import { User, Booking, WalletLedger, UserRole, UserStatus, VerificationStatus, AuditLog, Complaint, SystemConfig, Problem, AdminRole, Category, CityConfig } from '../types';
import { generateProblems, CATEGORIES } from '../constants';

class DatabaseService {
  private readonly STORAGE_KEY = 'DOORSTEP_PRO_CORE_DB_V9_PROD';
  private db: any = {
    users: [],
    bookings: [],
    ledger: [],
    auditLogs: [],
    complaints: [],
    problems: [],
    config: { schemaVersion: 9.0, aiKillSwitch: false, autoMatchingEnabled: true, globalPlatformFee: 10 }
  };

  constructor() {
    this.load();
  }

  private load() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) this.db = JSON.parse(data);
    
    if (!this.db.problems || this.db.problems.length < 2000) {
      this.db.problems = generateProblems();
      this.save();
    }

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
  getAuditLogs(): AuditLog[] { return this.db.auditLogs; }
  getConfig(): SystemConfig { return this.db.config; }
  getCategories(): Category[] { return CATEGORIES; }
  getCities(): CityConfig[] {
    return [
      { code: 'DL', name: 'Delhi', isEnabled: true, platformFee: 10, minProviderBalance: 500 },
      { code: 'MUM', name: 'Mumbai', isEnabled: true, platformFee: 10, minProviderBalance: 500 }
    ];
  }

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
    this.db.ledger.push(entry);
    const user = this.db.users.find((u: any) => u.id === entry.userId);
    if (user) user.walletBalance += (entry.type === 'CREDIT' ? entry.amount : -entry.amount);
    this.save();
  }

  async audit(actorId: string, action: string, entity: string, metadata?: any, severity: string = 'INFO') {
    this.db.auditLogs.push({
      id: `AUDIT_${Date.now()}`,
      actorId, action, entity, entityId: 'SYSTEM',
      metadata: { ...metadata, severity },
      timestamp: new Date().toISOString()
    });
    this.save();
  }
}

export const db = new DatabaseService();
