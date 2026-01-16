
// Fixed: Using default import for db service
import db from './DatabaseService';
import { User, UserStatus, BookingStatus, ComplaintSeverity, UserRole } from './types';

class QualityIntelligenceService {
  
  async updateQualityScore(providerId: string) {
    const provider = db.getUsers().find(u => u.id === providerId);
    if (!provider || provider.role !== UserRole.PROVIDER) return;

    const providerBookings = db.getBookings().filter(b => b.providerId === providerId);
    const completed = providerBookings.filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.PAID);
    
    // SLA Factor
    const slaBreaches = providerBookings.filter(b => b.isSLABreached).length;
    const slaScore = Math.max(0, 100 - (slaBreaches * 15));

    // Rating Factor
    const rated = completed.filter(b => b.rating !== undefined);
    const avgRating = rated.length > 0 
      ? (rated.reduce((s, b) => s + (b.rating || 0), 0) / rated.length) * 20 
      : 80;

    // Completion Factor
    const completionRate = providerBookings.length > 0 
      ? (completed.length / providerBookings.length) * 100 
      : 100;

    const finalQualityScore = Math.round(
      (avgRating * 0.4) + 
      (completionRate * 0.4) + 
      (slaScore * 0.2)
    );

    provider.qualityScore = finalQualityScore;
    provider.jobCount = completed.length;

    // Suspension Logic
    if (provider.qualityScore < 30) {
      provider.status = UserStatus.RETRAINING;
      await db.audit('SYSTEM', 'QUALITY_LOCK_TRIGGERED', 'User', { providerId, score: provider.qualityScore }, 'CRITICAL');
    }

    db.save();
  }
}

export const qualityService = new QualityIntelligenceService();
