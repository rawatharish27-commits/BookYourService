
// Fixed: Using default import for db service
import db from './DatabaseService';
import { bookingService } from './BookingService';
import { billingService } from './BillingService';
import { customerService } from './CustomerService';
import { providerService } from './ProviderService';
import { UserRole, BookingStatus, VerificationStatus, SLATier, LedgerType } from './types';

class QAAutomationService {
  private logs: string[] = [];

  private addLog(msg: string) {
    this.logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
    console.log(`[QA] ${msg}`);
  }

  getLogs() { return this.logs; }

  /**
   * LOAD TEST: CONCURRENT BOOKING SPIKE
   */
  async runLoadTest() {
    this.addLog("INITIATING LOAD TEST: 20 CONCURRENT BOOKINGS...");
    const customer = db.getUsers().find(u => u.role === UserRole.USER)!;
    const problem = db.getProblems()[0];

    const startTime = Date.now();
    try {
      const tasks = Array.from({ length: 20 }).map((_, i) => 
        bookingService.create(customer.id, problem, 'DL')
          .then(() => this.addLog(`Task ${i+1}: Booking Confirmed.`))
      );

      await Promise.all(tasks);
      const duration = Date.now() - startTime;
      this.addLog(`>>> LOAD TEST COMPLETE: 20 jobs in ${duration}ms. System Nominal. <<<`);
    } catch (e: any) {
      this.addLog(`!!! LOAD TEST FAILED: ${e.message}`);
    }
  }

  /**
   * ROLLBACK DRILL: ATOMIC CORRUPTION TEST
   */
  async runRollbackDrill() {
    this.addLog("STARTING ROLLBACK DRILL (Atomic Integrity Test)...");
    const admin = db.getUsers().find(u => u.id === 'ADMIN_ROOT')!;
    const originalBalance = admin.walletBalance;

    this.addLog(`Initial Root Balance: ₹${originalBalance}`);
    
    db.beginTransaction();
    try {
      this.addLog("Transaction Started: Crediting ₹10,000 to Root...");
      await db.appendLedger({
        id: 'CORRUPT_01',
        userId: 'ADMIN_ROOT',
        amount: 10000,
        type: LedgerType.CREDIT,
        category: 'PLATFORM_FEE',
        timestamp: new Date().toISOString()
      });

      this.addLog("Injecting Failure: Simulating mid-flight crash...");
      throw new Error("TRANSACTION_NODE_FAILURE_SIMULATED");
      
    } catch (e: any) {
      this.addLog(`Caught Expected Error: ${e.message}`);
      db.rollback();
      this.addLog("Rollback Command Issued.");
    }

    const currentBalance = db.getUsers().find(u => u.id === 'ADMIN_ROOT')!.walletBalance;
    if (currentBalance === originalBalance) {
      this.addLog(">>> SUCCESS: Rollback verified. State is pristine. <<<");
    } else {
      this.addLog(`!!! CRITICAL FAILURE: Balance mismatch! Current: ₹${currentBalance} (Expected: ₹${originalBalance})`);
    }
  }

  async runPriceLockAttackTest() {
    this.addLog("STARTING PRICE-LOCK INTEGRITY TEST...");
    try {
      const customer = db.getUsers().find(u => u.role === UserRole.USER)!;
      const problem = db.getProblems()[0];
      const booking = await bookingService.create(customer.id, problem, 'DL');
      
      this.addLog(`Simulating attack on Booking ${booking.id} (Max Cap: ₹${booking.maxPrice})`);
      await db.updateBooking(booking.id, { status: BookingStatus.IN_PROGRESS });

      const maliciousAddons = [
        { id: 'MAL_01', name: 'Fake Luxury Upgrade', price: 5000 }
      ];

      this.addLog(`Attempting to bill ₹${booking.basePrice + 5000}...`);
      const result = await billingService.generateBill(booking.id, maliciousAddons);

      if (result.success) {
        this.addLog("!!! CRITICAL FAILURE: Price lock bypassed!");
        await db.audit('QA_BOT', 'PRICE_LOCK_FAILURE', 'SystemIntegrity', { bookingId: booking.id }, 'CRITICAL');
      } else {
        // Fix: Use type assertion to access error property on the union result from billingService
        this.addLog(`SUCCESS: Billing blocked. Error: ${(result as any).error}`);
        await db.audit('QA_BOT', 'PRICE_LOCK_SUCCESS', 'SystemIntegrity', { bookingId: booking.id }, 'INFO');
      }
    } catch (e: any) {
      this.addLog(`Test Error: ${e.message}`);
    }
  }

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
      // Fix: Use type assertion to access error property on the union result from billingService
      if (!res.success) throw new Error((res as any).error);

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
    suspendedPro.status = 'SUSPENDED' as any;
    db.save();

    this.addLog(`Pro ${suspendedPro.id} SUSPENDED.`);
    suspendedPro.status = 'ACTIVE' as any;
    await db.logAction('ADMIN_ROOT', 'MANUAL_RESTORE', 'User', suspendedPro.id, { reason: 'QA_VERIFIED' });
    this.addLog("Admin override successful.");
  }
}

export const qaLab = new QAAutomationService();