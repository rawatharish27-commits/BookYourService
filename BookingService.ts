
import { db } from './DatabaseService';
import { Booking, BookingStatus, User, Addon } from './types';
import { billingService } from './BillingService';

class BookingService {
  
  /**
   * Step 7: Create Booking
   */
  async create(userId: string, problem: any, city: string): Promise<Booking> {
    const booking: Booking = {
      id: `BK_${Date.now()}`,
      userId,
      serviceId: problem.id,
      problemTitle: problem.title,
      status: BookingStatus.CREATED,
      basePrice: problem.basePrice,
      maxPrice: problem.maxPrice,
      addons: [],
      city,
      createdAt: new Date().toISOString()
    };
    await db.createBooking(booking);
    return booking;
  }

  /**
   * Step 6: State Machine Transition Controller
   */
  async transition(bookingId: string, nextStatus: BookingStatus, metadata: any = {}): Promise<boolean> {
    const bookings = db.getBookings();
    const b = bookings.find(x => x.id === bookingId);
    if (!b) return false;

    // Strict Rule Engine
    const allowed = this.isTransitionAllowed(b.status, nextStatus);
    if (!allowed) {
      console.error(`Invalid State Transition: ${b.status} -> ${nextStatus}`);
      return false;
    }

    // Business Logic Hooks
    if (nextStatus === BookingStatus.COMPLETED) {
      const success = await billingService.generateBill(bookingId, metadata.addons || []);
      if (!success) return false;
    }

    await db.updateBooking(bookingId, { 
      status: nextStatus, 
      providerId: metadata.providerId || b.providerId,
      total: metadata.total || b.total
    });
    
    return true;
  }

  private isTransitionAllowed(current: BookingStatus, next: BookingStatus): boolean {
    // Fix: Added missing [BookingStatus.VERIFIED] to the workflow map to satisfy the Record<BookingStatus, BookingStatus[]> type.
    const workflow: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.CREATED]: [BookingStatus.VERIFIED, BookingStatus.ASSIGNED, BookingStatus.CANCELLED],
      [BookingStatus.VERIFIED]: [BookingStatus.ASSIGNED, BookingStatus.CANCELLED],
      [BookingStatus.ASSIGNED]: [BookingStatus.ACCEPTED, BookingStatus.CREATED],
      [BookingStatus.ACCEPTED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
      [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
      [BookingStatus.COMPLETED]: [BookingStatus.PAID],
      [BookingStatus.PAID]: [BookingStatus.CLOSED],
      [BookingStatus.CLOSED]: [],
      [BookingStatus.CANCELLED]: []
    };
    return workflow[current].includes(next);
  }
}

export const bookingService = new BookingService();
