import { User, Booking, Problem, SystemConfig } from '../../../frontend/src/types';
import { generateProblems } from '../../../frontend/src/constants';

class DatabaseService {
  private readonly STORAGE_KEY = 'DP_ENTERPRISE_DB';
  private db: any = {
    users: [],
    bookings: [],
    ledger: [],
    auditLogs: [],
    problems: [],
    config: { schemaVersion: 9.0, aiKillSwitch: false }
  };

  constructor() {
    this.load();
  }

  private load() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) this.db = JSON.parse(data);
    
    if (this.db.problems.length < 2000) {
      this.db.problems = generateProblems();
      this.save();
    }
  }

  public save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.db));
  }

  getUsers(): User[] { return this.db.users; }
  getBookings(): Booking[] { return this.db.bookings; }
  getProblems(): Problem[] { return this.db.problems; }
  getConfig(): SystemConfig { return this.db.config; }

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

  async audit(actorId: string, action: string, entity: string, metadata?: any) {
    this.db.auditLogs.push({ id: Date.now(), actorId, action, entity, timestamp: new Date().toISOString(), metadata });
    this.save();
  }
}

export const db = new DatabaseService();