
import { UserEntity, FraudSignal, FraudType, Booking, Problem } from './types';

/**
 * PHASE-4: HYBRID FRAUD DETECTION & ML SCORING
 * Combines explicit rules with weighted feature scoring for "Explainable ML".
 */
class FraudDetectionEngine {
  
  analyze(provider: UserEntity, allUsers: UserEntity[], bookings: Booking[], problems: Problem[]): FraudSignal[] {
    const signals: FraudSignal[] = [];

    // R1: Same Aadhaar, Multiple Accounts
    const sameAadhaar = allUsers.filter(u => 
      u.id !== provider.id && 
      u.kyc_data?.aadhaarNumber === provider.kyc_data?.aadhaarNumber &&
      provider.kyc_data?.aadhaarNumber !== undefined
    );
    if (sameAadhaar.length > 0) {
      signals.push({
        id: `FRD_R1_${Date.now()}`,
        providerId: provider.id,
        type: FraudType.MULTI_ACCOUNT_SAME_ID,
        severity: 5,
        description: 'Identity collision detected. Multiple accounts sharing same Aadhaar hash.',
        evidence: { collided_with: sameAadhaar.map(u => u.id) },
        createdAt: new Date().toISOString()
      });
    }

    // R2: Price Tampering Attempt
    const providerBookings = bookings.filter(b => b.provider_id === provider.id);
    const tamperingAttempt = providerBookings.find(b => {
      const template = problems.find(p => p.ontologyId === b.ontologyId);
      return template && b.total_amount > template.maxPrice;
    });
    if (tamperingAttempt) {
      signals.push({
        id: `FRD_R3_${Date.now()}`,
        providerId: provider.id,
        type: FraudType.PRICE_TAMPERING,
        severity: 5,
        description: `Billing violation on Job ID ${tamperingAttempt.id}. Amount exceeded system cap.`,
        evidence: { booking_id: tamperingAttempt.id, amount: tamperingAttempt.total_amount },
        createdAt: new Date().toISOString()
      });
    }

    // R3: High Cancellation Rate
    const totalJobs = providerBookings.length;
    const cancelledJobs = providerBookings.filter(b => b.status === 'CANCELLED').length;
    if (totalJobs > 5 && (cancelledJobs / totalJobs) > 0.3) {
      signals.push({
        id: `FRD_R4_${Date.now()}`,
        providerId: provider.id,
        type: FraudType.HIGH_CANCELLATION,
        severity: 3,
        description: `Unusual cancellation velocity: ${(cancelledJobs/totalJobs * 100).toFixed(0)}%`,
        evidence: { ratio: cancelledJobs / totalJobs },
        createdAt: new Date().toISOString()
      });
    }

    return signals;
  }

  /**
   * ML-Assisted Explainable Scoring Model
   * Weight-based scoring using observable features.
   */
  calculateMLFraudScore(providerId: string, allUsers: UserEntity[], bookings: Booking[]): { score: number; level: string; reasons: string[] } {
    const provider = allUsers.find(u => u.id === providerId);
    if (!provider) return { score: 0, level: 'LOW', reasons: [] };

    const providerBookings = bookings.filter(b => b.provider_id === providerId);
    const reasons: string[] = [];
    let score = 0;

    // 1. Cancellation Feature (30% weight)
    const cancelledRate = providerBookings.length > 0 
      ? (providerBookings.filter(b => b.status === 'CANCELLED').length / providerBookings.length) 
      : 0;
    if (cancelledRate > 0.4) {
      score += 30;
      reasons.push(`Cancellation rate (${(cancelledRate*100).toFixed(0)}%) > 40%`);
    } else if (cancelledRate > 0.2) {
      score += 15;
      reasons.push('Elevated cancellation rate');
    }

    // 2. Identity Collision Feature (10% weight)
    const collided = allUsers.some(u => u.id !== providerId && u.kyc_data?.aadhaarNumber === provider.kyc_data?.aadhaarNumber && u.kyc_data?.aadhaarNumber);
    if (collided) {
      score += 10;
      reasons.push('Aadhaar hash reuse detected');
    }

    // 3. Billing Anomaly Feature (20% weight)
    const hasTampering = providerBookings.some(b => b.status === 'FLAGGED');
    if (hasTampering) {
      score += 20;
      reasons.push('Historical price tampering signal');
    }

    // 4. Trust Decay (25% weight)
    if (provider.trust_score < 70) {
      score += 25;
      reasons.push(`Trust score calibration critically low: ${provider.trust_score}%`);
    }

    // Final Normalization
    score = Math.min(score + (Math.random() * 5), 100); // Small entropy factor
    
    let level = 'LOW';
    if (score >= 75) level = 'CRITICAL';
    else if (score >= 60) level = 'HIGH';
    else if (score >= 40) level = 'MEDIUM';

    return { score: Math.round(score), level, reasons };
  }

  getAutomatedAction(signals: FraudSignal[]): 'MONITOR' | 'WARN' | 'SUSPEND' | 'BAN' {
    const totalSeverity = signals.reduce((sum, s) => sum + s.severity, 0);
    if (totalSeverity >= 10) return 'BAN';
    if (totalSeverity >= 7) return 'SUSPEND';
    if (totalSeverity >= 4) return 'WARN';
    return 'MONITOR';
  }
}

export const fraudEngine = new FraudDetectionEngine();
