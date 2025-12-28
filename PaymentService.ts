
import { PaymentMethod, PaymentStatus } from './types';
import { db } from './DatabaseService';

class PaymentService {
  /**
   * Simulates a UPI Payment Intent generation and verification.
   */
  async processUPI(amount: number, bookingId: string): Promise<boolean> {
    console.log(`Generating UPI Intent for ₹${amount} (Booking: ${bookingId})`);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isSuccess = Math.random() > 0.05; // 95% success rate for simulation
    
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
}

export const paymentService = new PaymentService();
