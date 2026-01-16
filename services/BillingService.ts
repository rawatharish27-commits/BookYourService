
import { db } from './DatabaseService';
import { BookingStatus } from '../types';

class BillingService {
  async generateBill(bookingId: string, addons: any[]) {
    const b = db.getBookings().find(x => x.id === bookingId);
    if (!b) return { success: false, error: 'Not found' };
    const total = b.basePrice + addons.reduce((s, a) => s + a.price, 0);
    if (total > b.maxPrice) return { success: false, error: 'Price cap exceeded' };
    
    await db.updateBooking(bookingId, { status: BookingStatus.COMPLETED, total });
    return { success: true };
  }
}

export const billingService = new BillingService();
