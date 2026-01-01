
// Fixed: Using default import for db service
import db from './DatabaseService';
import { Booking, BookingStatus, UserRole, SLATier, ProviderStatus, VerificationStatus } from './types';
import { ai } from './AIIntelligenceService';

class BookingService {
  private readonly SLA_MINUTES = {
    [SLATier.GOLD]: 15,
    [SLATier.SILVER]: 45,
    [SLATier.BRONZE]: 120
  };

  constructor() {
    this.startBackgroundJobs();
  }

  private startBackgroundJobs() {
    setInterval(() => this.checkSLA(), 30000);
  }

  private checkSLA() {
    const now = new Date();
    db.getBookings().forEach(b => {
      if (!b.isSLABreached && ![BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(b.status) && new Date(b.slaDeadline) < now) {
        db.updateBooking(b.id, { isSLABreached: true });
        db.audit('SYSTEM', 'SLA_BREACH', 'Booking', { bookingId: b.id }, 'CRITICAL');
      }
    });
  }

  async create(userId: string, problem: any, city: string): Promise<Booking> {
    db.beginTransaction();
    try {
      const user = db.getUsers().find(u => u.id === userId);
      if (!user || user.status === 'SUSPENDED') throw new Error("User barred from platform.");

      const slaMinutes = this.SLA_MINUTES[problem.slaTier as SLATier] || 60;
      const deadline = new Date(Date.now() + slaMinutes * 60000).toISOString();

      const booking: Booking = {
        id: `BK_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        userId,
        serviceId: problem.id,
        problemTitle: problem.title,
        status: BookingStatus.CREATED,
        basePrice: problem.basePrice,
        maxPrice: problem.maxPrice,
        addons: [],
        city,
        createdAt: new Date().toISOString(),
        slaDeadline: deadline,
        isSLABreached: false,
        slaTier: problem.slaTier,
        category: problem.category
      };

      db.getBookings().push(booking);
      await db.logAction(userId, 'BOOKING_CREATED', 'Booking', booking.id, { service: problem.title });
      db.commit();
      
      ai.predictCancellation(booking.id);
      this.matchProvider(booking.id);
      
      return booking;
    } catch (e) {
      db.rollback();
      throw e;
    }
  }

  async matchProvider(bookingId: string) {
    const booking = db.getBookings().find(b => b.id === bookingId);
    if (!booking || booking.status !== BookingStatus.CREATED) return;

    // GATING: Only Verified and Online Providers
    const eligibleProviders = db.getUsers().filter(u => 
      u.role === UserRole.PROVIDER && 
      u.city === booking.city && 
      u.providerStatus === ProviderStatus.ONLINE &&
      u.verificationStatus === VerificationStatus.ACTIVE
    );

    if (eligibleProviders.length > 0) {
      const sorted = await Promise.all(eligibleProviders.map(async p => ({
        provider: p,
        rank: await ai.calculateRank(p.id)
      })));

      const bestPro = sorted.sort((a, b) => b.rank - a.rank)[0].provider;
      
      db.beginTransaction();
      try {
        await db.updateBooking(bookingId, { 
          providerId: bestPro.id, 
          status: BookingStatus.ACCEPTED,
          assignedAt: new Date().toISOString() 
        });
        await db.logAction('SYSTEM', 'PROVIDER_MATCHED', 'Booking', bookingId, { providerId: bestPro.id });
        db.commit();
      } catch {
        db.rollback();
      }
    }
  }
}

export const bookingService = new BookingService();
