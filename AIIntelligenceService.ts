
import { db } from './DatabaseService';
import { User, Booking, BookingStatus } from './types';

class AIIntelligenceService {
  
  /**
   * Step 13: Provider Ranking
   * rank = completionRate * 0.3 + rating * 0.25 - fraudScore * 0.2;
   */
  async calculateRank(providerId: string): Promise<number> {
    const users = db.getUsers();
    const provider = users.find(u => u.id === providerId);
    if (!provider) return 0;

    const bookings = db.getBookings().filter(b => b.providerId === providerId);
    if (bookings.length === 0) return 50; // Baseline

    const completionRate = bookings.filter(b => b.status === BookingStatus.COMPLETED).length / bookings.length;
    
    const ratedBookings = bookings.filter(b => b.rating !== undefined);
    const avgRating = ratedBookings.length > 0 
      ? ratedBookings.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBookings.length 
      : 4.0; // Default rating

    const rank = (completionRate * 30) + (avgRating * 25 / 5) - (provider.fraudScore * 0.2);
    
    provider.rank = Math.round(rank);
    db.save();
    
    return provider.rank;
  }
}

export const ai = new AIIntelligenceService();
