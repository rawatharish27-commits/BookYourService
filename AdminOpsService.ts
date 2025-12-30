
import { db } from './DatabaseService';
import { AdminRole, UserRole, CityConfig, Problem, Category, BookingStatus, VerificationStatus } from './types';
import { paymentService } from './PaymentService';
import { providerService } from './ProviderService';

class AdminOpsService {

  private checkPermission(adminId: string, required: AdminRole): void {
    const admin = db.getUsers().find(u => u.id === adminId && u.role === UserRole.ADMIN);
    if (!admin) {
      db.audit('SYSTEM', 'UNAUTHORIZED_ACCESS_ATTEMPT', 'AdminGate', { adminId, required }, 'CRITICAL');
      throw new Error("Unauthorized: Administrative context missing.");
    }
    
    const hierarchy = {
      [AdminRole.SUPER_ADMIN]: 3,
      [AdminRole.OPS_MANAGER]: 2,
      [AdminRole.SUPPORT_AGENT]: 1
    };

    if (hierarchy[admin.adminRole as AdminRole] < hierarchy[required]) {
      db.audit(adminId, 'PERMISSION_DENIED', 'AdminGate', { action: required, currentRole: admin.adminRole }, 'WARNING');
      throw new Error(`Forbidden: Role ${admin.adminRole} does not have ${required} clearances.`);
    }
  }

  /**
   * GLOBAL PRICING SYNC
   */
  async syncCategoryPricing(adminId: string, categoryId: string, multiplier: number) {
    this.checkPermission(adminId, AdminRole.OPS_MANAGER);
    db.beginTransaction();
    try {
      const category = db.getCategories().find(c => c.id === categoryId);
      const problems = db.getProblems().filter(p => p.category === category?.name);
      
      problems.forEach(p => {
        const oldBase = p.basePrice;
        p.basePrice = Math.round(p.basePrice * multiplier);
        p.maxPrice = Math.round(p.maxPrice * multiplier);
        db.logAction(adminId, 'PRICE_SYNC_NODE', 'Problem', p.id, { oldBase, newBase: p.basePrice });
      });

      await db.logAction(adminId, 'GLOBAL_PRICING_SYNC', 'Category', categoryId, { multiplier });
      db.commit();
      return true;
    } catch (e) {
      db.rollback();
      return false;
    }
  }

  /**
   * INDIVIDUAL PROBLEM PRICING UPDATE
   * Updates basePrice and maxPrice for a specific problem node with audit logging.
   */
  async updateProblemPricing(adminId: string, problemId: string, basePrice: number, maxPrice: number) {
    this.checkPermission(adminId, AdminRole.OPS_MANAGER);
    db.beginTransaction();
    try {
      const problems = db.getProblems();
      const problem = problems.find(p => p.id === problemId);
      if (!problem) throw new Error("Problem node not found in ontology.");

      const oldBase = problem.basePrice;
      const oldMax = problem.maxPrice;
      
      problem.basePrice = basePrice;
      problem.maxPrice = maxPrice;

      await db.logAction(adminId, 'UPDATE_PROBLEM_PRICING', 'Problem', problemId, { 
        oldBase, newBase: basePrice, 
        oldMax, newMax: maxPrice 
      });
      db.commit();
      return true;
    } catch (e) {
      db.rollback();
      return false;
    }
  }

  async resolveDispute(adminId: string, complaintId: string, resolution: 'REFUND' | 'DISMISS' | 'PENALIZE_PRO') {
    this.checkPermission(adminId, AdminRole.SUPPORT_AGENT);
    
    const complaint = db.getComplaints().find(c => c.id === complaintId);
    if (!complaint) throw new Error("Complaint not found.");

    db.beginTransaction();
    try {
      if (resolution === 'REFUND') {
        await paymentService.processRefund(complaint.bookingId);
      } else if (resolution === 'PENALIZE_PRO') {
        const booking = db.getBookings().find(b => b.id === complaint.bookingId);
        if (booking?.providerId) {
          await providerService.applyPenalty(booking.providerId, 500, `High Severity Dispute: ${complaint.description}`);
        }
      }
      
      complaint.status = 'RESOLVED';
      await db.logAction(adminId, 'DISPUTE_RESOLVED', 'Complaint', complaintId, { resolution });
      db.commit();
    } catch (e) {
      db.rollback();
      throw e;
    }
  }

  getOpsStats() {
    const bookings = db.getBookings();
    const ledger = db.getLedger();
    const now = new Date().toDateString();

    return {
      unassigned: bookings.filter(b => b.status === BookingStatus.CREATED).length,
      slaBreaches: bookings.filter(b => b.isSLABreached).length,
      openComplaints: db.getComplaints().filter(c => c.status === 'OPEN').length,
      revenueToday: ledger
        .filter(l => l.category === 'PLATFORM_FEE' && new Date(l.timestamp).toDateString() === now)
        .reduce((s, l) => s + l.amount, 0)
    };
  }
}

export const adminOps = new AdminOpsService();
