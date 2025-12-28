
import { User, Booking, WalletLedger, UserRole, UserStatus, VerificationStatus, AuditLog } from './types';

class DatabaseService {
  private readonly STORAGE_KEY = 'DOORSTEP_BACKEND_DB_V2';

  private db: {
    users: User[];
    bookings: Booking[];
    ledger: WalletLedger[];
    auditLogs: AuditLog[];
  } = {
    users: [],
    bookings: [],
    ledger: [],
    auditLogs: []
  };

  constructor() {
    this.load();
  }

  private load() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.db = JSON.parse(data);
    } else {
      // Seed Admin
      this.db.users.push({
        id: 'ADMIN_ROOT',
        phone: '9999999999',
        name: 'System Admin',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        verificationStatus: VerificationStatus.ACTIVE,
        city: 'SYSTEM',
        walletBalance: 0,
        fraudScore: 0,
        createdAt: new Date().toISOString()
      });
      this.save();
    }
  }

  public save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.db));
  }

  getUsers() { return this.db.users; }
  getBookings() { return this.db.bookings; }
  getLedger() { return this.db.ledger; }
  getAuditLogs() { return this.db.auditLogs; }

  async upsertUser(user: User) {
    const idx = this.db.users.findIndex(u => u.id === user.id);
    if (idx > -1) this.db.users[idx] = user;
    else this.db.users.push(user);
    this.save();
  }

  async logAction(actorId: string, action: string, entity: string, entityId: string, metadata?: any) {
    const log: AuditLog = {
      id: `AUDIT_${Date.now()}`,
      actorId,
      action,
      entity,
      entityId,
      metadata,
      timestamp: new Date().toISOString()
    };
    this.db.auditLogs.push(log);
    this.save();
  }

  async createBooking(booking: Booking) {
    this.db.bookings.push(booking);
    this.save();
  }

  async updateBooking(id: string, updates: Partial<Booking>) {
    const idx = this.db.bookings.findIndex(b => b.id === id);
    if (idx > -1) {
      this.db.bookings[idx] = { ...this.db.bookings[idx], ...updates };
      this.save();
    }
  }

  async appendLedger(entry: WalletLedger) {
    this.db.ledger.push(entry);
    const user = this.db.users.find(u => u.id === entry.userId);
    if (user) {
      user.walletBalance += (entry.type === 'CREDIT' ? entry.amount : -entry.amount);
    }
    this.save();
  }

  // Support for Feedback Story 11
  async addFeedback(bookingId: string, rating: number, comment: string, tags: string[]) {
    const idx = this.db.bookings.findIndex(b => b.id === bookingId);
    if (idx > -1) {
      this.db.bookings[idx].rating = rating;
      // In a real implementation, feedback metadata would be stored in a separate table/collection
      this.save();
    }
  }

  // Aliases for compatibility with various services
  async updateRequest(id: string, updates: Partial<Booking>) {
    return this.updateBooking(id, updates);
  }

  async audit(actorId: string, action: string, entity: string, metadata?: any, severity: string = 'INFO') {
    return this.logAction(actorId, action, entity, 'N/A', { ...metadata, severity });
  }

  getRequests() {
    return this.getBookings();
  }
}

export const db = new DatabaseService();
