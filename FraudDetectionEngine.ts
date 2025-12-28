
import { UserEntity, FraudSignal, FraudType, Booking, Problem, BookingStatus } from './types';

class FraudDetectionEngine {
  
  analyze(provider: UserEntity, allUsers: UserEntity[], bookings: Booking[], problems: Problem[]): FraudSignal[] {
    const signals: FraudSignal[] = [];

    // STORY 7.1 — Identity & Device Collision
    if (provider.kyc_data?.aadhaarNumber) {
      const sameAadhaar = allUsers.filter(u => 
        u.id !== provider.id && 
        u.kyc_data?.aadhaarNumber === provider.kyc_data?.aadhaarNumber
      );
      if (sameAadhaar.length > 0) {
        signals.push(this.createSignal(provider.id, FraudType.MULTI_ACCOUNT_SAME_ID, 5, 'Duplicate Aadhaar mapped to multiple accounts.', { collisions: sameAadhaar.map(u => u.id) }));
      }
    }

    if (provider.deviceId) {
      const sameDevice = allUsers.filter(u => u.id !== provider.id && u.deviceId === provider.deviceId);
      if (sameDevice.length >= 2) {
        signals.push(this.createSignal(provider.id, FraudType.DEVICE_COLLISION, 4, 'Hardware fingerprint shared across multiple identities.', { deviceId: provider.deviceId }));
      }
    }

    // STORY 7.1 — Cancellation Abuse Detection
    const providerBookings = bookings.filter(b => b.provider_id === provider.id);
    const last10 = providerBookings.slice(0, 10);
    const cancellationCount = last10.filter(b => b.status === BookingStatus.CANCELLED).length;
    
    if (cancellationCount >= 4) {
      signals.push(this.createSignal(provider.id, FraudType.HIGH_CANCELLATION, 4, 'Abnormal cancellation velocity (hoarding detected).', { rate: '40%+' }));
    }

    // STORY 7.1 — Price Tampering
    const tamperingAttempt = providerBookings.find(b => {
      const template = problems.find(p => p.ontologyId === b.ontologyId);
      return template && b.total_amount > (template.maxPrice + 200); // Buffer for valid addons
    });
    if (tamperingAttempt) {
      signals.push(this.createSignal(provider.id, FraudType.PRICE_TAMPERING, 5, 'Attempted bill manipulation beyond ontology limits.', { bookingId: tamperingAttempt.id }));
    }

    return signals;
  }

  private createSignal(providerId: string, type: FraudType, severity: number, description: string, evidence: any): FraudSignal {
    return {
      id: `SIG_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      providerId,
      type,
      severity,
      description,
      evidence,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * STORY 7.2 — ML Fraud Scoring Feature Pipeline
   */
  calculateRiskScore(providerId: string, allUsers: UserEntity[], signals: FraudSignal[], bookings: Booking[]): number {
    let score = 0;
    
    // Feature 1: Signal Accumulation
    const providerSignals = signals.filter(s => s.providerId === providerId);
    score += providerSignals.reduce((acc, s) => acc + (s.severity * 15), 0);

    // Feature 2: Reliability decay
    const providerBookings = bookings.filter(b => b.provider_id === providerId);
    if (providerBookings.length > 0) {
       const completionRate = providerBookings.filter(b => b.status === BookingStatus.COMPLETED).length / providerBookings.length;
       if (completionRate < 0.6) score += 20;
    }

    // Cap at 100
    return Math.min(score, 100);
  }
}

export const fraudEngine = new FraudDetectionEngine();
