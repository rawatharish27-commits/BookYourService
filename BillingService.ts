
import { db } from './DatabaseService';
import { Addon, LedgerType, BookingStatus } from './types';

class BillingService {
  private readonly PLATFORM_FEE = 10;

  /**
   * Step 8: Price Lock Validation
   */
  async generateBill(bookingId: string, addons: Addon[]): Promise<boolean> {
    const bookings = db.getBookings();
    const b = bookings.find(x => x.id === bookingId);
    if (!b) return false;

    const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const finalTotal = b.basePrice + addonsTotal;

    // PRICE LOCK: Check against Ontology Max Price
    if (finalTotal > b.maxPrice) {
      console.warn(`[BILLING-BLOCK] Price Violation! Total ₹${finalTotal} exceeds Max ₹${b.maxPrice}`);
      return false; 
    }

    // Step 9: Wallet Ledger (Append-only)
    await this.processSettlement(b.id, b.providerId!, finalTotal);

    await db.updateBooking(bookingId, { 
      total: finalTotal, 
      addons,
      status: BookingStatus.PAID 
    });

    return true;
  }

  private async processSettlement(bookingId: string, providerId: string, total: number) {
    const payout = total - this.PLATFORM_FEE;

    // Append Provider Payout
    await db.appendLedger({
      id: `L_${Date.now()}_P`,
      userId: providerId,
      bookingId,
      amount: payout,
      type: LedgerType.CREDIT,
      category: 'SERVICE_PAYOUT',
      timestamp: new Date().toISOString()
    });

    // Append Platform Revenue
    await db.appendLedger({
      id: `L_${Date.now()}_A`,
      userId: 'ADMIN_ROOT',
      bookingId,
      amount: this.PLATFORM_FEE,
      type: LedgerType.CREDIT,
      category: 'PLATFORM_FEE',
      timestamp: new Date().toISOString()
    });
  }
}

export const billingService = new BillingService();
