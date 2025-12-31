import { db } from './DatabaseService';
import { Booking, BookingStatus, UserRole, SLATier, ProviderStatus, VerificationStatus } from '../types';

class BookingService {
  private readonly SLA_MINUTES = {
    [SLATier.GOLD]: 30,
    [SLATier.SILVER]: 90,
    [SLATier.BRONZE]: 240
  };

  async create(userId: string, problem: any, city: string): Promise<Booking> {
    const slaMinutes = this.SLA_MINUTES[problem.slaTier as SLATier] || 120;
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
    await db.audit(userId, 'BOOKING_CREATED', 'Booking', { bookingId: booking.id, title: problem.title });
    db.save();
    
    // Simulate immediate automated matching
    setTimeout(() => this.matchProvider(booking.id), 1000);
    
    return booking;
  }

  async matchProvider(bookingId: string) {
    const booking = db.getBookings().find(b => b.id === bookingId);
    if (!booking) return;

    const eligibleProviders = db.getUsers().filter(u => 
      u.role === UserRole.PROVIDER && 
      u.city === booking.city && 
      u.providerStatus === ProviderStatus.ONLINE &&
      u.verificationStatus === VerificationStatus.ACTIVE
    );

    if (eligibleProviders.length > 0) {
      // Simple rank-based matching simulation
      const bestPro = eligibleProviders.sort((a,b) => b.qualityScore - a.qualityScore)[0];
      await db.updateBooking(bookingId, { 
        providerId: bestPro.id, 
        status: BookingStatus.ACCEPTED,
        assignedAt: new Date().toISOString() 
      });
      await db.audit('SYSTEM', 'PROVIDER_ASSIGNED', 'Booking', { bookingId, providerId: bestPro.id });
    }
  }
}

export const bookingService = new BookingService();