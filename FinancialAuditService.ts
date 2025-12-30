
import { db } from './DatabaseService';
import { User, WalletLedger, UserRole } from './types';

export interface AuditResult {
  userId: string;
  userName: string;
  cachedBalance: number;
  calculatedBalance: number;
  isConsistent: boolean;
  discrepancy: number;
}

class FinancialAuditService {
  /**
   * RECONCILIATION ENGINE
   * Re-calculates balances for all users from raw ledger events
   */
  async runGlobalReconciliation(): Promise<{
    results: AuditResult[];
    totalPlatformRevenue: number;
    systemIntegrity: boolean;
  }> {
    const users = db.getUsers();
    const ledger = db.getLedger();
    const results: AuditResult[] = [];
    let systemIntegrity = true;
    let totalRevenue = 0;

    users.forEach(user => {
      const userEntries = ledger.filter(l => l.userId === user.id);
      const calculatedBalance = userEntries.reduce((sum, entry) => {
        return sum + (entry.type === 'CREDIT' ? entry.amount : -entry.amount);
      }, 0);

      const isConsistent = Math.abs(calculatedBalance - user.walletBalance) < 0.01;
      if (!isConsistent) systemIntegrity = false;

      results.push({
        userId: user.id,
        userName: user.name,
        cachedBalance: user.walletBalance,
        calculatedBalance,
        isConsistent,
        discrepancy: calculatedBalance - user.walletBalance
      });

      if (user.id === 'ADMIN_ROOT') {
        totalRevenue = calculatedBalance;
      }
    });

    await db.logAction('SYSTEM', 'FINANCIAL_RECONCILIATION_RUN', 'Ledger', 'GLOBAL', { systemIntegrity });
    
    return { results, totalPlatformRevenue: totalRevenue, systemIntegrity };
  }

  /**
   * FEE LEAKAGE DETECTION
   * Checks for COMPLETED jobs that missed a platform fee entry
   */
  async detectFeeLeakage(): Promise<string[]> {
    const bookings = db.getBookings().filter(b => b.total && b.total > 0);
    const ledger = db.getLedger().filter(l => l.category === 'PLATFORM_FEE');
    const leaks: string[] = [];

    bookings.forEach(b => {
      const feeEntry = ledger.find(l => l.bookingId === b.id);
      if (!feeEntry) {
        leaks.push(`Booking ${b.id}: No platform fee detected in ledger.`);
      }
    });

    return leaks;
  }
}

export const financialAudit = new FinancialAuditService();
