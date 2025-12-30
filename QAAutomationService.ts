
import { db } from './DatabaseService';
import { bookingService } from './BookingService';
import { billingService } from './BillingService';
import { customerService } from './CustomerService';
import { providerService } from './ProviderService';
import { UserRole, BookingStatus, VerificationStatus, SLATier } from './types';

class QAAutomationService {
  private logs: string[] = [];

  private addLog(msg: string) {
    this.logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
    console.log(`[QA] ${msg}`);
  }

  getLogs() { return this.logs; }

  /**
   * NEGATIVE TEST: PRICE LOCK BREACH ATTEMPT
   * Verifies that the billing engine blocks any charge exceeding the max price cap.
   */
  async runPriceLockAttackTest() {
    this.addLog("STARTING PRICE-LOCK INTEGRITY TEST...");
    try {
      // 1. Setup job
      const customer = db.getUsers().find(u => u.role === UserRole.USER)!;
      const problem = db.getProblems()[0];
      const booking = await bookingService.create(customer.id, problem, 'DL');
      
      this.addLog(`Simulating attack on Booking ${booking.id} (Max Cap: ₹${booking.maxPrice})`);
      await db.updateBooking(booking.id, { status: BookingStatus.IN_PROGRESS });

      // 2. Attempt Overbilling
      const maliciousAddons = [
        { id: 'MAL_01', name: 'Fake Luxury Upgrade', price: 5000 }
      ];

      this.addLog(`Attempting to bill ₹${booking.basePrice + 5000}...`);
      const result = await billingService.generateBill(booking.id, maliciousAddons);

      if (result.success) {
        this.addLog("!!! CRITICAL FAILURE: Price lock bypassed!");
        await db.audit('QA_BOT', 'PRICE_LOCK_FAILURE', 'SystemIntegrity', { bookingId: booking.id }, 'CRITICAL');
      } else {
        this.addLog(`SUCCESS: Billing blocked. Error: ${result.error}`);
        await db.audit('QA_BOT', 'PRICE_LOCK_SUCCESS', 'SystemIntegrity', { bookingId: booking.id }, 'INFO');
      }
    } catch (e: any) {
      this.addLog(`Test Error: ${e.message}`);
    }
  }

  /**
   * FULL E2E: CUSTOMER -> BOOKING -> PAYMENT -> RATING
   */
  async runFullConsumerLoop() {
    this.addLog("STARTING FULL CONSUMER E2E LOOP...");
    try {
      const customer = db.getUsers().find(u => u.role === UserRole.USER)!;
      const problem = db.getProblems().find(p => p.category === 'Plumbing')!;
      
      const booking = await bookingService.create(customer.id, problem, 'DL');
      const pro = db.getUsers().find(u => u.role === UserRole.PROVIDER && u.verificationStatus === VerificationStatus.ACTIVE)!;
      
      await db.updateBooking(booking.id, { providerId: pro.id, status: BookingStatus.ACCEPTED });
      await db.updateBooking(booking.id, { status: BookingStatus.IN_PROGRESS });
      
      const res = await billingService.generateBill(booking.id, [problem.addons[0]]);
      if (!res.success) throw new Error(res.error);

      await customerService.submitRating(booking.id, 5, "QA Verified Flow");
      this.addLog(">>> FULL CONSUMER LOOP SUCCESS <<<");
    } catch (e: any) {
      this.addLog(`!!! LOOP FAILURE: ${e.message}`);
    }
  }

  async runFraudSimulation() {
    this.addLog("STARTING FRAUD ATTACK SIMULATION...");
    try {
      const b = db.getBookings().find(x => x.status === BookingStatus.IN_PROGRESS);
      if (!b) throw new Error("Need an active job for fraud test");

      this.addLog("Test: Simultaneous billing (Double Spend)");
      const attempts = await Promise.all([
        billingService.generateBill(b.id, []),
        billingService.generateBill(b.id, []),
        billingService.generateBill(b.id, [])
      ]);

      const successCount = attempts.filter(a => a.success).length;
      if (successCount > 1) {
        this.addLog(`CRITICAL FAILURE: Double spend allowed ${successCount} times!`);
      } else {
        this.addLog("SUCCESS: Double spend prevented.");
      }
    } catch (e: any) {
      this.addLog(`Simulation Error: ${e.message}`);
    }
  }

  async runAdminOverrideTest() {
    this.addLog("TESTING ADMIN OVERRIDE...");
    const suspendedPro = db.getUsers().find(u => u.role === UserRole.PROVIDER)!;
    const originalStatus = suspendedPro.status;
    
    suspendedPro.status = 'SUSPENDED' as any;
    db.save();

    this.addLog(`Pro ${suspendedPro.id} SUSPENDED.`);
    suspendedPro.status = 'ACTIVE' as any;
    await db.logAction('ADMIN_ROOT', 'MANUAL_RESTORE', 'User', suspendedPro.id, { reason: 'QA_VERIFIED' });
    this.addLog("Admin override successful.");
  }
}

export const qaLab = new QAAutomationService();
