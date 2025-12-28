
import { PaymentMethod, PaymentStatus, BookingStatus } from './types';
import { db } from './DatabaseService';

class PaymentService {
  /**
   * Simulates a UPI Payment Intent generation and verification.
   */
  async processUPI(amount: number, bookingId: string): Promise<boolean> {
    console.log(`Generating UPI Intent for ₹${amount} (Booking: ${bookingId})`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isSuccess = Math.random() > 0.05; 
    
    if (isSuccess) {
      await db.updateRequest(bookingId, { 
        payment_status: PaymentStatus.SUCCESS,
        payment_method: PaymentMethod.UPI 
      });
      await db.audit('USER', 'PAYMENT_SUCCESS', 'Payment', { bookingId, amount, method: 'UPI' });
    } else {
      await db.audit('USER', 'PAYMENT_FAILURE', 'Payment', { bookingId, amount, method: 'UPI' }, 'ERROR');
    }
    
    return isSuccess;
  }

  /**
   * Sets payment to COD (Cash on Delivery)
   */
  async setCOD(bookingId: string): Promise<void> {
    await db.updateRequest(bookingId, { 
      payment_status: PaymentStatus.PENDING,
      payment_method: PaymentMethod.COD 
    });
    await db.audit('USER', 'PAYMENT_COD_SET', 'Payment', { bookingId });
  }

  /**
   * STORY 9.2 — Refund Handling
   */
  async processRefund(bookingId: string): Promise<boolean> {
    const requests = await db.getRequests();
    const req = requests.find(r => r.id === bookingId);
    
    if (!req || req.payment_status !== PaymentStatus.SUCCESS) return false;

    console.log(`Initiating automated refund for Booking: ${bookingId}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    await db.updateRequest(bookingId, { 
      payment_status: PaymentStatus.REFUNDED,
      status: BookingStatus.CANCELLED
    });

    await db.audit('SYSTEM', 'REFUND_PROCESSED', 'Payment', { bookingId, amount: req.total_amount || req.total });
    return true;
  }
}

export const paymentService = new PaymentService();
