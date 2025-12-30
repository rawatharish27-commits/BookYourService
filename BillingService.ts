
import { db } from './DatabaseService';
import { Addon, LedgerType, BookingStatus, PaymentStatus } from './types';
import { PLATFORM_FEE } from './constants';

class BillingService {
  
  validateAddons(bookingId: string, addons: Addon[]): { valid: boolean; total: number; error?: string } {
    const b = db.getBookings().find(x => x.id === bookingId);
    if (!b) return { valid: false, total: 0, error: 'Booking not found' };

    if ([BookingStatus.COMPLETED, BookingStatus.PAID].includes(b.status)) {
      return { valid: false, total: 0, error: 'Job already settled.' };
    }

    const total = b.basePrice + addons.reduce((sum, a) => sum + a.price, 0);

    if (total > b.maxPrice) {
      return { valid: false, total, error: `Exceeds price-lock cap of ₹${b.maxPrice}.` };
    }

    return { valid: true, total };
  }

  async generateBill(bookingId: string, addons: Addon[]): Promise<{ success: boolean; error?: string }> {
    const b = db.getBookings().find(x => x.id === bookingId);
    if (!b || b.status !== BookingStatus.IN_PROGRESS) {
      return { success: false, error: "Invalid job state for billing." };
    }

    const validation = this.validateAddons(bookingId, addons);
    if (!validation.valid) return { success: false, error: validation.error };

    db.beginTransaction();
    try {
      const finalTotal = validation.total;
      const payout = finalTotal - PLATFORM_FEE;
      const timestamp = new Date().toISOString();

      // 1. Update Booking
      await db.updateBooking(bookingId, { 
        total: finalTotal, 
        addons,
        status: BookingStatus.COMPLETED,
        payment_status: PaymentStatus.SUCCESS,
        completedAt: timestamp
      });

      // 2. Partner Payout
      await db.appendLedger({
        id: `L_${Date.now()}_P`,
        userId: b.providerId!,
        bookingId,
        amount: payout,
        type: LedgerType.CREDIT,
        category: 'SERVICE_PAYOUT',
        timestamp
      });

      // 3. Platform Revenue
      await db.appendLedger({
        id: `L_${Date.now()}_F`,
        userId: 'ADMIN_ROOT',
        bookingId,
        amount: PLATFORM_FEE,
        type: LedgerType.CREDIT,
        category: 'PLATFORM_FEE',
        timestamp
      });

      await db.logAction('BILLING', 'SETTLEMENT', 'Booking', bookingId, { total: finalTotal });
      db.commit();
      return { success: true };
    } catch (e) {
      db.rollback();
      return { success: false, error: "Transactional settlement failed." };
    }
  }
}

export const billingService = new BillingService();
