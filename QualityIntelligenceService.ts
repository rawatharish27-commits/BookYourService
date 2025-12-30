
import { db } from './DatabaseService';
import { User, UserStatus, BookingStatus, ComplaintSeverity, UserRole } from './types';

class QualityIntelligenceService {
  
  /**
   * 1. Rating Impact Engine & 4. Quality Score Calculator
   */
  async updateQualityScore(providerId: string) {
    const provider = db.getUsers().find(u => u.id === providerId);
    if (!provider || provider.role !== UserRole.PROVIDER) return;

    const providerBookings = db.getBookings().filter(b => b.providerId === providerId);
    const completed = providerBookings.filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.PAID);
    const complaints = db.getComplaints().filter(c => {
      const booking = db.getBookings().find(b => b.id === c.bookingId);
      return booking?.providerId === providerId;
    });

    // Factors
    const ratingWeight = 0.4;
    const completionWeight = 0.4;
    const complaintPenaltyWeight = 0.2;

    // Calc Average Rating (out of 100 scale)
    const rated = completed.filter(b => b.rating !== undefined);
    const avgRating = rated.length > 0 
      ? (rated.reduce((s, b) => s + (b.rating || 0), 0) / rated.length) * 20 
      : 80; // Default 4 stars = 80%

    // Calc Completion Rate
    const completionRate = providerBookings.length > 0 
      ? (completed.length / providerBookings.length) * 100 
      : 100;

    // Calc Complaint Impact
    const severityMap = {
      [ComplaintSeverity.LOW]: 5,
      [ComplaintSeverity.MEDIUM]: 15,
      [ComplaintSeverity.HIGH]: 40,
      [ComplaintSeverity.CRITICAL]: 100
    };
    const totalComplaintDeduction = complaints.reduce((sum, c) => sum + (severityMap[c.severity] || 0), 0);
    const complaintScore = Math.max(0, 100 - totalComplaintDeduction);

    const finalQualityScore = Math.round(
      (avgRating * ratingWeight) + 
      (completionRate * completionWeight) + 
      (complaintScore * complaintPenaltyWeight)
    );

    provider.qualityScore = finalQualityScore;
    provider.jobCount = completed.length;

    // 3. Probation Logic
    if (provider.isProbation && provider.jobCount >= 5) {
      provider.isProbation = false;
      provider.status = UserStatus.ACTIVE;
      await db.logAction('SYSTEM', 'PROBATION_PASSED', 'User', providerId);
    }

    // 6. Trust Badge Engine
    this.evaluateTrustBadge(provider);

    // 5. Auto Retraining Trigger
    if (provider.qualityScore < 40 && provider.status !== UserStatus.RETRAINING) {
      await this.triggerRetraining(providerId);
    }

    db.save();
  }

  private evaluateTrustBadge(provider: User) {
    if (provider.isProbation) return;
    
    if (provider.qualityScore >= 95 && provider.jobCount > 50) provider.trustBadge = 'ELITE';
    else if (provider.qualityScore >= 85) provider.trustBadge = 'GOLD';
    else if (provider.qualityScore >= 70) provider.trustBadge = 'SILVER';
    else if (provider.qualityScore >= 50) provider.trustBadge = 'BRONZE';
    else provider.trustBadge = undefined;
  }

  /**
   * 2. Complaint Severity Engine
   */
  async classifyComplaint(complaintId: string): Promise<ComplaintSeverity> {
    const complaint = db.getComplaints().find(c => c.id === complaintId);
    if (!complaint) return ComplaintSeverity.LOW;

    const desc = complaint.description.toLowerCase();
    if (desc.includes('stole') || desc.includes('harass') || desc.includes('fight') || desc.includes('drunk')) {
      return ComplaintSeverity.CRITICAL;
    }
    if (desc.includes('damage') || desc.includes('broke') || desc.includes('expensive')) {
      return ComplaintSeverity.HIGH;
    }
    if (desc.includes('late') || desc.includes('rude')) {
      return ComplaintSeverity.MEDIUM;
    }
    return ComplaintSeverity.LOW;
  }

  /**
   * 5. Auto Retraining Trigger
   */
  private async triggerRetraining(providerId: string) {
    const provider = db.getUsers().find(u => u.id === providerId);
    if (!provider) return;

    provider.status = UserStatus.RETRAINING;
    provider.providerStatus = 'OFFLINE' as any; // Force offline
    
    await db.logAction('SYSTEM', 'RETRAINING_TRIGGERED', 'User', providerId, {
      reason: 'Quality score fell below threshold',
      score: provider.qualityScore
    });

    console.warn(`[QUALITY-NODE] Provider ${providerId} sent to mandatory retraining.`);
  }
}

export const qualityService = new QualityIntelligenceService();
