
import { ServiceRequestEntity, AIRiskAssessment, SLATier, BookingStatus, RiskLevel, UserEntity, ProviderRank, Booking } from './types';

class AIIntelligenceService {
  /**
   * Calculates a proactive risk score (0-100) for a service request.
   */
  assessRisk(request: ServiceRequestEntity, allRequests: ServiceRequestEntity[]): AIRiskAssessment {
    let score = 0;
    const factors: string[] = [];

    if (request.sla_deadline && ![BookingStatus.COMPLETED, BookingStatus.CLOSED].includes(request.status)) {
      const now = new Date().getTime();
      const created = new Date(request.created_at).getTime();
      const deadline = new Date(request.sla_deadline).getTime();
      const progress = (now - created) / (deadline - created);
      if (progress > 0.85) { score += 40; factors.push('Critical SLA Proximity (>85%)'); }
      else if (progress > 0.65) { score += 25; factors.push('SLA Threshold Warning (>65%)'); }
    }
    if (request.priority === 'CRITICAL' || request.priority === 'HIGH') { score += 20; factors.push('High Severity Classification'); }
    const wardBacklog = allRequests.filter(r => r.ward_id === request.ward_id && ![BookingStatus.COMPLETED, BookingStatus.CLOSED].includes(r.status)).length;
    if (wardBacklog > 10) { score += 20; factors.push(`Hyper-congestion (${wardBacklog} active)`); }
    const predicted_delay_prob = Math.min(score / 100 + (Math.random() * 0.1), 0.99);
    let level: RiskLevel = RiskLevel.LOW;
    if (score >= 80) level = RiskLevel.CRITICAL;
    else if (score >= 60) level = RiskLevel.HIGH;
    else if (score >= 30) level = RiskLevel.MEDIUM;

    return { score, level, factors, predicted_delay_prob: parseFloat(predicted_delay_prob.toFixed(2)) };
  }

  /**
   * AI Ranking Engine (Fair & Explainable)
   * Formula: 0.30*Completion + 0.25*Rating + 0.20*OnTime - 0.15*Cancels - 0.10*Fraud
   */
  calculateProviderRank(providerId: string, bookings: Booking[], fraudScore: number): ProviderRank {
    const pBookings = bookings.filter(b => b.provider_id === providerId);
    const completed = pBookings.filter(b => b.status === BookingStatus.COMPLETED).length;
    const cancelled = pBookings.filter(b => b.status === BookingStatus.CANCELLED).length;
    const total = pBookings.length;

    const completionRate = total > 0 ? (completed / total) : 0;
    const cancellationRate = total > 0 ? (cancelled / total) : 0;
    const avgRating = 4.5; // Default for simulation
    const slaAdherence = 0.95; // Default for simulation

    let score = (completionRate * 30) + (avgRating * 25 / 5) + (slaAdherence * 20) - (cancellationRate * 15) - (fraudScore * 0.10);
    score = Math.max(0, Math.min(100, Math.round(score)));

    const reasons: string[] = [];
    if (completionRate > 0.9) reasons.push('High completion reliability');
    if (cancellationRate < 0.1) reasons.push('Disciplined booking management');
    if (fraudScore > 20) reasons.push('Trust calibration deduction applied');

    return {
      score,
      tier: score >= 85 ? 'PREMIER' : score >= 50 ? 'STANDARD' : 'RESTRICTED',
      reasons,
      lastCalculated: new Date().toISOString()
    };
  }

  suggestPriority(severity: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (severity >= 9) return 'CRITICAL';
    if (severity >= 7) return 'HIGH';
    if (severity >= 4) return 'MEDIUM';
    return 'LOW';
  }
}

export const ai = new AIIntelligenceService();
