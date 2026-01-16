
import { User, Booking, BookingStatus, SLATier, UserRole } from './types';
// Fixed: Using default import for db service
import db from './DatabaseService';

class AIIntelligenceService {
  
  /**
   * 1. Refined Provider Ranking Engine
   */
  async calculateRank(providerId: string): Promise<number> {
    const config = db.getConfig();
    if (config.aiKillSwitch) return 50; // Return neutral rank if AI is killed

    const provider = db.getUsers().find(u => u.id === providerId);
    if (!provider) return 0;

    const bookings = db.getBookings().filter(b => b.providerId === providerId);
    if (bookings.length === 0) return 50;

    const completionRate = bookings.filter(b => b.status === BookingStatus.COMPLETED).length / bookings.length;
    
    // SLA Factor
    const slaBreaches = bookings.filter(b => b.isSLABreached).length;
    const slaHealth = Math.max(0, 100 - (slaBreaches * 10)) / 100;

    // Quality Factor
    const qualityFactor = (provider.qualityScore || 80) / 100;

    const rank = (completionRate * 30) + (qualityFactor * 40) + (slaHealth * 30) - (provider.fraudScore * 0.2);
    
    provider.rank = Math.round(rank);
    db.save();
    
    return provider.rank;
  }

  /**
   * 2. Demand Forecast Engine
   */
  forecastDemand(city: string): Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> {
    const bookings = db.getBookings().filter(b => b.city === city);
    const categoryCounts: Record<string, number> = {};
    
    bookings.forEach(b => {
      const cat = b.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const forecast: Record<string, any> = {};
    Object.keys(categoryCounts).forEach(cat => {
      const count = categoryCounts[cat];
      if (count > 20) forecast[cat] = 'HIGH';
      else if (count > 5) forecast[cat] = 'MEDIUM';
      else forecast[cat] = 'LOW';
    });

    return forecast;
  }

  /**
   * 3. Cancellation Predictor
   */
  predictCancellation(bookingId: string): number {
    const config = db.getConfig();
    if (config.aiKillSwitch) return 0;

    const b = db.getBookings().find(x => x.id === bookingId);
    const user = db.getUsers().find(u => u.id === b?.userId);
    if (!b || !user) return 0;

    let probability = 0;
    
    // Factor: User's historical abuse score
    probability += (user.abuseScore || 0) * 0.6;

    // Factor: Booking timing (Odd hours increase cancellation risk)
    const hour = new Date(b.createdAt).getHours();
    if (hour < 7 || hour > 22) probability += 20;

    // Factor: City node health (Saturated nodes have more churn)
    const nodeBookings = db.getBookings().filter(x => x.city === b.city && x.status === BookingStatus.CREATED);
    if (nodeBookings.length > 50) probability += 15;

    const finalProb = Math.min(99, Math.round(probability));
    db.updateBooking(bookingId, { cancelProbability: finalProb });
    
    return finalProb;
  }

  /**
   * 4. Revenue Forecast Engine
   */
  forecastRevenue(): { current: number, projected: number } {
    const ledger = db.getLedger().filter(l => l.category === 'PLATFORM_FEE');
    const current = ledger.reduce((sum, l) => sum + l.amount, 0);
    
    // Linear projection based on last 7 days growth
    const projected = Math.round(current * 1.15); // Simple 15% placeholder growth
    
    return { current, projected };
  }

  /**
   * 5. Bias Audit Engine
   */
  auditBias(): { score: number, issues: string[] } {
    const users = db.getUsers().filter(u => u.role === UserRole.PROVIDER);
    const issues: string[] = [];
    
    // check city-based quality score distribution
    const cityAverages: Record<string, { total: number, count: number }> = {};
    users.forEach(u => {
      if (!cityAverages[u.city]) cityAverages[u.city] = { total: 0, count: 0 };
      cityAverages[u.city].total += u.qualityScore;
      cityAverages[u.city].count += 1;
    });

    let maxDiff = 0;
    const averages = Object.values(cityAverages).map(v => v.total / v.count);
    if (averages.length > 1) {
      maxDiff = Math.max(...averages) - Math.min(...averages);
    }

    if (maxDiff > 25) issues.push(`High Variance in Quality Scores between Cities (${maxDiff.toFixed(1)}%)`);

    const biasScore = Math.max(0, 100 - maxDiff);
    return { score: Math.round(biasScore), issues };
  }

  /**
   * 6. AI Kill-Switch Toggle
   */
  toggleKillSwitch(enabled: boolean) {
    db.updateConfig({ aiKillSwitch: enabled });
    db.audit('ADMIN_ROOT', enabled ? 'AI_KILL_SWITCH_ACTIVATED' : 'AI_SYSTEM_RESTORED', 'SystemConfig', { status: enabled }, 'CRITICAL');
  }
}

export const ai = new AIIntelligenceService();
