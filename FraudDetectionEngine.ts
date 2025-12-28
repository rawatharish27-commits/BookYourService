
import { User, Booking, BookingStatus } from './types';
import { db } from './DatabaseService';

class FraudDetectionEngine {
  
  /**
   * Story 12: On booking completed, recalculate fraud score
   */
  async calculateFraudScore(userId: string): Promise<number> {
    const bookings = db.getBookings().filter(b => b.providerId === userId);
    if (bookings.length === 0) return 0;

    let score = 0;

    // 1. Price Tampering Check (Booking Total > MaxPrice is already blocked by BillingService, 
    // but here we check for multiple close-to-max attempts)
    const tightMaxPrices = bookings.filter(b => b.total && b.total >= b.maxPrice * 0.95).length;
    score += tightMaxPrices * 10;

    // 2. High Cancellation Velocity
    const cancellations = bookings.filter(b => b.status === BookingStatus.CANCELLED).length;
    score += (cancellations / bookings.length) * 100;

    // 3. Duplicate Payout Attempts (Metadata check in ledger)
    const ledger = db.getLedger().filter(l => l.userId === userId && l.category === 'SERVICE_PAYOUT');
    const duplicateCheck = new Set(ledger.map(l => l.bookingId)).size !== ledger.length;
    if (duplicateCheck) score += 50;

    const finalScore = Math.min(100, Math.round(score));
    
    // Update User Score
    const users = db.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.fraudScore = finalScore;
      if (finalScore > 80) {
        user.status = 'SUSPENDED' as any;
        await db.logAction('SYSTEM', 'FRAUD_SUSPENSION', 'User', userId, { score: finalScore });
      }
      db.save();
    }

    return finalScore;
  }
}

export const fraudEngine = new FraudDetectionEngine();
