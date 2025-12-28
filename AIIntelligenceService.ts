
import { ServiceRequestEntity, AIRiskAssessment, SLATier, BookingStatus, RiskLevel, UserEntity, ProviderRank, Booking, RatingEntry } from './types';

class AIIntelligenceService {
  /**
   * Rating Decay Logic for Story 5.1
   * Older ratings have lower impact on the overall provider score.
   */
  calculateWeightedRating(history: RatingEntry[] = []): number {
    if (history.length === 0) return 4.0; // Global Baseline

    const now = new Date().getTime();
    let totalWeight = 0;
    let weightedSum = 0;

    history.forEach(entry => {
      const ageInDays = (now - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      // Exponential decay: halve weight every 30 days
      const weight = Math.pow(0.5, ageInDays / 30);
      
      weightedSum += entry.stars * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? parseFloat((weightedSum / totalWeight).toFixed(1)) : 4.0;
  }

  /**
   * AI Ranking Engine (Enhanced for Epic 5)
   * Formula: 0.3*Reliability + 0.3*WeightedRating + 0.2*SLA - 0.2*QualityTriggers
   */
  calculateProviderRank(provider: UserEntity, bookings: Booking[], fraudScore: number): ProviderRank {
    const pBookings = bookings.filter(b => b.provider_id === provider.id);
    const completed = pBookings.filter(b => b.status === BookingStatus.COMPLETED).length;
    const total = pBookings.length;

    const reliability = total > 0 ? (completed / total) : 1;
    const weightedRating = this.calculateWeightedRating(provider.rating_history);
    const slaAdherence = 0.95; // Simulated

    let score = (reliability * 30) + (weightedRating * 30 / 5) + (slaAdherence * 20) - (fraudScore * 0.2);
    score = Math.max(0, Math.min(100, Math.round(score)));

    const reasons: string[] = [];
    if (weightedRating >= 4.5) reasons.push('Excellent recent quality');
    if (reliability < 0.7) reasons.push('Low reliability on matched jobs');
    if (provider.verification_status === 'PROBATION') reasons.push('Under Quality Probation');

    return {
      score,
      tier: score >= 85 ? 'PREMIER' : score >= 50 ? 'STANDARD' : 'RESTRICTED',
      reasons,
      lastCalculated: new Date().toISOString()
    };
  }

  assessRisk(request: ServiceRequestEntity, allRequests: ServiceRequestEntity[]): AIRiskAssessment {
    let score = 0;
    const factors: string[] = [];

    if (request.sla_deadline && ![BookingStatus.COMPLETED, BookingStatus.CLOSED].includes(request.status)) {
      const now = new Date().getTime();
      const created = new Date(request.created_at).getTime();
      const deadline = new Date(request.sla_deadline).getTime();
      const progress = (now - created) / (deadline - created);
      if (progress > 0.85) { score += 40; factors.push('Critical SLA Proximity (>85%)'); }
    }
    
    if (request.priority === 'CRITICAL') { score += 30; factors.push('Critical Severity Job'); }

    const predicted_delay_prob = Math.min(score / 100 + (Math.random() * 0.05), 0.99);
    let level: RiskLevel = RiskLevel.LOW;
    if (score >= 80) level = RiskLevel.CRITICAL;
    else if (score >= 40) level = RiskLevel.HIGH;

    return { score, level, factors, predicted_delay_prob: parseFloat(predicted_delay_prob.toFixed(2)) };
  }
}

export const ai = new AIIntelligenceService();
