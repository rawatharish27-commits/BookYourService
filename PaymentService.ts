
import { PaymentMethod, PaymentStatus, BookingStatus, LedgerType } from './types';
import { db } from './DatabaseService';

class PaymentService {
  private canProcessPayment(bookingId: string): boolean {
    const b = db.getBookings().find(x => x.id === bookingId);
    if (!b) return false;
    if (b.status === BookingStatus.CANCELLED) return false;
    if (b.payment_status === PaymentStatus.SUCCESS) return false;
    return true;
  }

  async processUPI(amount: number, bookingId: string): Promise<boolean> {
    if (!this.canProcessPayment(bookingId)) return false;

    console.log(`Generating UPI Intent for ₹${amount} (Booking: ${bookingId})`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const isSuccess = Math.random() > 0.02; 
    
    if (isSuccess) {
      await db.updateBooking(bookingId, { 
        payment_status: PaymentStatus.SUCCESS,
        payment_method: PaymentMethod.UPI 
      });
      await db.audit('USER', 'PAYMENT_SUCCESS', 'Payment', { bookingId, amount, method: 'UPI' });
    }
    
    return isSuccess;
  }

  async setCOD(bookingId: string): Promise<void> {
    await db.updateBooking(bookingId, { 
      payment_status: PaymentStatus.PENDING,
      payment_method: PaymentMethod.COD 
    });
    await db.audit('USER', 'PAYMENT_COD_SET', 'Payment', { bookingId });
  }

  /**
   * HARDENED REFUND ENGINE
   * Reverses payouts and platform fees in a single atomic block
   */
  async processRefund(bookingId: string): Promise<{ success: boolean; error?: string }> {
    const req = db.getBookings().find(r => r.id === bookingId);
    
    if (!req) return { success: false, error: "Booking node not found." };
    // Fixed: Reordered status checks to ensure unreachable code error is resolved and redundant checks removed.
    if (req.payment_status === PaymentStatus.REFUNDED) return { success: false, error: "Already refunded." };
    if (req.payment_status !== PaymentStatus.SUCCESS) return { success: false, error: "Cannot refund unpaid job." };

    db.beginTransaction();
    try {
      const timestamp = new Date().toISOString();
      const amountToRefund = req.total || 0;

      // 1. Credit back the User Hub
      await db.appendLedger({
        id: `L_${Date.now()}_REF_USER`,
        userId: req.userId,
        bookingId,
        amount: amountToRefund,
        type: LedgerType.CREDIT,
        category: 'REFUND',
        timestamp
      });

      // 2. Debit the Provider Hub (Recover Payout)
      if (req.providerId && req.total) {
        // Assume PLATFORM_FEE was 10 (from constants)
        const payoutToRecover = req.total - 10;
        await db.appendLedger({
          id: `L_${Date.now()}_REF_PRO`,
          userId: req.providerId,
          bookingId,
          amount: payoutToRecover,
          type: LedgerType.DEBIT,
          category: 'REFUND',
          timestamp
        });

        // 3. Debit the Admin Hub (Recover Fee)
        await db.appendLedger({
          id: `L_${Date.now()}_REF_FEE`,
          userId: 'ADMIN_ROOT',
          bookingId,
          amount: 10,
          type: LedgerType.DEBIT,
          category: 'REFUND',
          timestamp
        });
      }

      // 4. Update Booking State
      await db.updateBooking(bookingId, { 
        payment_status: PaymentStatus.REFUNDED,
        status: BookingStatus.CANCELLED
      });

      await db.logAction('SYSTEM', 'REFUND_SETTLED', 'Booking', bookingId, { amount: amountToRefund });
      
      db.commit();
      return { success: true };
    } catch (e: any) {
      db.rollback();
      return { success: false, error: "Refund failed: " + e.message };
    }
  }
}

export const paymentService = new PaymentService();
