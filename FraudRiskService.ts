
import { db } from './DatabaseService';
import { User, UserRole, UserStatus, FraudSignal, FraudType, ProviderStatus } from './types';

class FraudRiskService {
  
  private signals: FraudSignal[] = [];

  async analyzeBehavior(userId: string) {
    const user = db.getUsers().find(u => u.id === userId);
    if (!user) return;

    await this.checkPriceTampering(user);
    await this.checkCancellationVelocity(user);

    // Score Aggregator triggers auto-actions
    this.recalculateFraudScore(userId);
  }

  private async checkPriceTampering(user: User) {
    const bookings = db.getBookings().filter(b => b.providerId === user.id && b.total !== undefined);
    if (bookings.length < 3) return;

    const maxedJobs = bookings.filter(b => b.total! >= b.maxPrice * 0.98);
    if (maxedJobs.length / bookings.length > 0.6) {
      await this.persistSignal(user.id, FraudType.PRICE_TAMPERING, 45, "Billing anomaly: Consistently hitting max price cap.");
    }
  }

  private async checkCancellationVelocity(user: User) {
    const bookings = db.getBookings().filter(b => b.providerId === user.id);
    const recent = bookings.slice(-10);
    const cancelled = recent.filter(b => b.status === 'CANCELLED' as any);

    if (recent.length >= 5 && cancelled.length >= 4) {
      await this.persistSignal(user.id, FraudType.CANCELLATION_VELOCITY, 50, "High cancellation velocity detected.");
    }
  }

  private async persistSignal(userId: string, type: FraudType, score: number, description: string) {
    const signal: FraudSignal = {
      id: `SIG_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      userId,
      type,
      score,
      description,
      timestamp: new Date().toISOString(),
      isDismissed: false
    };

    this.signals.push(signal);
    await db.audit('SYSTEM', `FRAUD_SIGNAL_${type}`, 'User', { userId, signalId: signal.id }, 'WARNING');
  }

  private recalculateFraudScore(userId: string) {
    const user = db.getUsers().find(u => u.id === userId);
    if (!user) return;

    const userSignals = this.signals.filter(s => s.userId === userId && !s.isDismissed);
    const totalScore = userSignals.reduce((sum, s) => sum + s.score, 0);

    user.fraudScore = Math.min(100, totalScore);

    // AUTO-ACTION: Immediate Suspension
    if (user.fraudScore >= 80) {
      this.suspendUser(user, "AUTO_FRAUD_LOCK_INTEGRITY_BREACH");
    } else if (user.fraudScore >= 50) {
      db.audit('SYSTEM', 'FRAUD_PROBATION', 'User', { userId, score: user.fraudScore }, 'CRITICAL');
    }

    db.save();
  }

  private suspendUser(user: User, reason: string) {
    user.status = UserStatus.SUSPENDED;
    if (user.role === UserRole.PROVIDER) {
      user.providerStatus = ProviderStatus.BANNED;
    }
    db.logAction('SYSTEM', 'AUTO_SUSPENSION', 'User', user.id, { reason, score: user.fraudScore });
    console.warn(`[FRAUD-GATE] User ${user.id} has been automatically suspended. Reason: ${reason}`);
  }

  async clearFraudSignals(adminId: string, userId: string) {
    const user = db.getUsers().find(u => u.id === userId);
    if (!user) return;

    const userSignals = this.signals.filter(s => s.userId === userId);
    userSignals.forEach(s => s.isDismissed = true);
    
    user.fraudScore = 0;
    if (user.status === UserStatus.SUSPENDED) {
      user.status = UserStatus.ACTIVE;
    }

    await db.logAction(adminId, 'MANUAL_FRAUD_CLEAR', 'User', userId);
    db.save();
  }

  getSignalsForUser(userId: string) {
    return this.signals.filter(s => s.userId === userId);
  }
}

export const fraudRiskService = new FraudRiskService();
