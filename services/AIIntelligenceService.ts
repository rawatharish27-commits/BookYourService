
import { db } from './DatabaseService';
import { BookingStatus } from '../types';

class AIIntelligenceService {
  async calculateRank(providerId: string): Promise<number> {
    const provider = db.getUsers().find(u => u.id === providerId);
    if (!provider) return 0;

    const bookings = db.getBookings().filter(b => b.providerId === providerId);
    if (bookings.length === 0) return 50;

    const completionRate = bookings.filter(b => b.status === BookingStatus.COMPLETED).length / bookings.length;
    return Math.round(completionRate * 100);
  }

  predictCancellation(bookingId: string): number {
    return Math.floor(Math.random() * 20);
  }
}

export const ai = new AIIntelligenceService();
