
// Fixed: Using default import for db service
import db from './DatabaseService';
import { User, Booking, BookingStatus, Complaint, ComplaintSeverity } from './types';
import { ai } from './AIIntelligenceService';

class CustomerService {
  /**
   * 1. City Detection & Binding
   */
  async detectCity(): Promise<string> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('DL'); // Default to Delhi Node
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // In a real app, we'd use reverse geocoding here.
          // For now, we simulate hub binding based on latitude.
          const lat = pos.coords.latitude;
          if (lat > 28) resolve('GGN'); // Gurgaon Hub
          else if (lat > 27) resolve('NDLS'); // Delhi Hub
          else resolve('MUM'); // Mumbai Hub
        },
        () => resolve('DL')
      );
    });
  }

  /**
   * 2. Customer Profile Service
   */
  async updateProfile(userId: string, updates: Partial<User>) {
    const user = db.getUsers().find(u => u.id === userId);
    if (user) {
      const updated = { ...user, ...updates };
      await db.upsertUser(updated);
      await db.logAction(userId, 'UPDATE_PROFILE', 'User', userId, updates);
      return updated;
    }
    return null;
  }

  /**
   * 3. Booking History Service
   */
  getHistory(userId: string): Booking[] {
    return db.getBookings()
      .filter(b => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * 4. Rating Capture Service
   */
  async submitRating(bookingId: string, rating: number, review?: string) {
    const booking = db.getBookings().find(b => b.id === bookingId);
    if (!booking) return false;

    await db.updateBooking(bookingId, { rating, review });
    await db.logAction(booking.userId, 'SUBMIT_RATING', 'Booking', bookingId, { rating });

    // Recalculate Provider Rank
    if (booking.providerId) {
      await ai.calculateRank(booking.providerId);
    }
    return true;
  }

  /**
   * 5. Complaint Service
   */
  async fileComplaint(bookingId: string, category: string, description: string) {
    const booking = db.getBookings().find(b => b.id === bookingId);
    if (!booking) return null;

    // Fix: Added mandatory severity property and ensuring ComplaintSeverity is imported
    const complaint: Complaint = {
      id: `CMP_${Date.now()}`,
      bookingId,
      userId: booking.userId,
      category,
      description,
      status: 'OPEN',
      severity: ComplaintSeverity.LOW,
      createdAt: new Date().toISOString()
    };

    await db.createComplaint(complaint);
    await db.updateBooking(bookingId, { complaintId: complaint.id });
    await db.logAction(booking.userId, 'FILE_COMPLAINT', 'Complaint', complaint.id);
    
    // Check for Customer Abuse on complaint filing
    await this.detectAbuse(booking.userId);
    
    return complaint;
  }

  /**
   * 6. Customer Abuse Detection
   */
  async detectAbuse(userId: string): Promise<number> {
    const user = db.getUsers().find(u => u.id === userId);
    if (!user) return 0;

    const userBookings = db.getBookings().filter(b => b.userId === userId);
    const complaints = db.getComplaints().filter(c => c.userId === userId);
    
    let abuseScore = 0;

    // Penalty for high cancellation rate (>30%)
    const cancellations = userBookings.filter(b => b.status === BookingStatus.CANCELLED).length;
    if (userBookings.length > 5 && (cancellations / userBookings.length) > 0.3) {
      abuseScore += 40;
    }

    // Penalty for high complaint frequency (>50% of jobs)
    if (userBookings.length > 3 && (complaints.length / userBookings.length) > 0.5) {
      abuseScore += 50;
    }

    user.abuseScore = Math.min(100, abuseScore);
    
    if (user.abuseScore > 80) {
      user.status = 'SUSPENDED' as any;
      await db.audit('SYSTEM', 'USER_ABUSE_SUSPENSION', 'User', { userId, score: user.abuseScore }, 'CRITICAL');
    }

    db.save();
    return user.abuseScore;
  }
}

export const customerService = new CustomerService();
