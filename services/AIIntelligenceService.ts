
import { db } from './DatabaseService';
import { BookingStatus, User, Booking } from '../types';

interface PredictionResult {
  probability: number;
  confidence: number;
  factors: string[];
}

interface ServiceDemand {
  serviceType: string;
  demand: 'low' | 'medium' | 'high';
  trend: 'increasing' | 'stable' | 'decreasing';
  predictedBookings: number;
}

interface ProviderInsights {
  providerId: string;
  performanceScore: number;
  recommendations: string[];
  riskFactors: string[];
  optimizationOpportunities: string[];
}

interface MarketAnalytics {
  totalBookings: number;
  averagePrice: number;
  topServices: Array<{ service: string; count: number; revenue: number }>;
  demandPatterns: ServiceDemand[];
  regionalTrends: Array<{ city: string; growth: number; saturation: number }>;
}

class AIIntelligenceService {
  /**
   * Advanced provider ranking algorithm with ML-like features
   */
  async calculateRank(providerId: string): Promise<number> {
    const provider = db.getUsers().find(u => u.id === providerId);
    if (!provider) return 0;

    const bookings = db.getBookings().filter(b => b.providerId === providerId);
    if (bookings.length === 0) return 50;

    // Multi-factor scoring algorithm
    const completionRate = bookings.filter(b => b.status === BookingStatus.COMPLETED).length / bookings.length;
    const averageRating = this.calculateAverageRating(providerId);
    const responseTime = this.calculateAverageResponseTime(providerId);
    const cancellationRate = bookings.filter(b => b.status === BookingStatus.CANCELLED).length / bookings.length;
    const repeatCustomerRate = this.calculateRepeatCustomerRate(providerId);

    // Weighted scoring (ML-inspired weights)
    const score = (
      completionRate * 0.3 +
      (averageRating / 5) * 0.25 +
      (1 - Math.min(responseTime / 24, 1)) * 0.2 + // Better for faster response
      (1 - cancellationRate) * 0.15 +
      repeatCustomerRate * 0.1
    ) * 100;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Machine learning-inspired cancellation prediction
   */
  predictCancellation(bookingId: string): PredictionResult {
    const booking = db.getBookings().find(b => b.id === bookingId);
    if (!booking) return { probability: 0, confidence: 0, factors: [] };

    const provider = db.getUsers().find(u => u.id === booking.providerId);
    const customer = db.getUsers().find(u => u.id === booking.customerId);

    let probability = 0;
    const factors: string[] = [];

    // Historical cancellation patterns
    const customerBookings = db.getBookings().filter(b => b.customerId === booking.customerId);
    const customerCancellationRate = customerBookings.filter(b => b.status === BookingStatus.CANCELLED).length / customerBookings.length;

    if (customerCancellationRate > 0.3) {
      probability += 25;
      factors.push('High customer cancellation history');
    }

    // Provider performance
    if (provider && provider.qualityScore && provider.qualityScore < 70) {
      probability += 20;
      factors.push('Low provider quality score');
    }

    // Booking characteristics
    const hoursUntilService = (new Date(booking.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilService < 2) {
      probability += 15;
      factors.push('Last-minute booking');
    }

    // Price sensitivity
    if (booking.total && booking.total > this.getAveragePriceForService(booking.serviceType) * 1.5) {
      probability += 10;
      factors.push('Above-average pricing');
    }

    // Weather impact (simplified)
    const weatherRisk = this.assessWeatherRisk(booking.scheduledDate);
    probability += weatherRisk.score;
    if (weatherRisk.factors.length > 0) {
      factors.push(...weatherRisk.factors);
    }

    const confidence = Math.min(100, factors.length * 20 + 30); // Base confidence plus factor bonus

    return {
      probability: Math.min(100, probability),
      confidence,
      factors
    };
  }

  /**
   * Demand forecasting for services
   */
  predictServiceDemand(serviceType: string, city: string, daysAhead: number = 7): ServiceDemand {
    const recentBookings = db.getBookings()
      .filter(b =>
        b.serviceType === serviceType &&
        b.city === city &&
        new Date(b.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      );

    const weeklyAverage = recentBookings.length / 4.3; // Approximate weeks in 30 days
    const trend = this.calculateTrend(recentBookings);

    let demand: 'low' | 'medium' | 'high' = 'medium';
    if (weeklyAverage < 5) demand = 'low';
    else if (weeklyAverage > 15) demand = 'high';

    const predictedBookings = Math.round(weeklyAverage * (1 + (trend === 'increasing' ? 0.2 : trend === 'decreasing' ? -0.1 : 0)));

    return {
      serviceType,
      demand,
      trend,
      predictedBookings
    };
  }

  /**
   * Comprehensive provider insights and recommendations
   */
  generateProviderInsights(providerId: string): ProviderInsights {
    const provider = db.getUsers().find(u => u.id === providerId);
    if (!provider) throw new Error('Provider not found');

    const bookings = db.getBookings().filter(b => b.providerId === providerId);
    const recommendations: string[] = [];
    const riskFactors: string[] = [];
    const optimizationOpportunities: string[] = [];

    // Performance analysis
    const completionRate = bookings.filter(b => b.status === BookingStatus.COMPLETED).length / bookings.length;
    const averageRating = this.calculateAverageRating(providerId);
    const responseTime = this.calculateAverageResponseTime(providerId);

    // Generate recommendations
    if (completionRate < 0.8) {
      recommendations.push('Focus on completing more bookings to improve your completion rate');
      riskFactors.push('Low completion rate may affect ranking');
    }

    if (averageRating < 4.0) {
      recommendations.push('Work on improving customer satisfaction to boost ratings');
      optimizationOpportunities.push('Consider customer feedback surveys');
    }

    if (responseTime > 12) {
      recommendations.push('Respond to booking requests faster to improve customer experience');
      optimizationOpportunities.push('Set up automated response notifications');
    }

    // Pricing optimization
    const averagePrice = bookings.reduce((sum, b) => sum + (b.total || 0), 0) / bookings.length;
    const marketAverage = this.getAveragePriceForService(bookings[0]?.serviceType || '');

    if (averagePrice > marketAverage * 1.2) {
      recommendations.push('Consider adjusting prices to be more competitive');
    } else if (averagePrice < marketAverage * 0.8) {
      optimizationOpportunities.push('You may be able to increase prices based on your quality');
    }

    // Schedule optimization
    const busyHours = this.analyzeBusyHours(bookings);
    if (busyHours.length > 0) {
      optimizationOpportunities.push(`Consider expanding availability during peak hours: ${busyHours.join(', ')}`);
    }

    const performanceScore = this.calculateRank(providerId);

    return {
      providerId,
      performanceScore,
      recommendations,
      riskFactors,
      optimizationOpportunities
    };
  }

  /**
   * Market analytics and insights
   */
  generateMarketAnalytics(city?: string): MarketAnalytics {
    const allBookings = city
      ? db.getBookings().filter(b => b.city === city)
      : db.getBookings();

    const totalBookings = allBookings.length;
    const totalRevenue = allBookings.reduce((sum, b) => sum + (b.total || 0), 0);
    const averagePrice = totalRevenue / totalBookings;

    // Top services analysis
    const serviceStats = new Map<string, { count: number; revenue: number }>();
    allBookings.forEach(booking => {
      const existing = serviceStats.get(booking.serviceType) || { count: 0, revenue: 0 };
      serviceStats.set(booking.serviceType, {
        count: existing.count + 1,
        revenue: existing.revenue + (booking.total || 0)
      });
    });

    const topServices = Array.from(serviceStats.entries())
      .map(([service, stats]) => ({ service, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Demand patterns
    const demandPatterns = Array.from(new Set(allBookings.map(b => b.serviceType)))
      .map(serviceType => this.predictServiceDemand(serviceType, city || 'all'))
      .filter(pattern => pattern.predictedBookings > 0);

    // Regional trends (simplified)
    const regionalTrends = city ? [] : [
      { city: 'Mumbai', growth: 15, saturation: 75 },
      { city: 'Delhi', growth: 12, saturation: 80 },
      { city: 'Bangalore', growth: 20, saturation: 65 },
      { city: 'Chennai', growth: 8, saturation: 70 },
    ];

    return {
      totalBookings,
      averagePrice,
      topServices,
      demandPatterns,
      regionalTrends
    };
  }

  // Helper methods
  private calculateAverageRating(providerId: string): number {
    const reviews = db.getLedger().filter(l =>
      l.category === 'SERVICE_REVIEW' &&
      l.metadata?.providerId === providerId &&
      l.metadata?.rating
    );
    if (reviews.length === 0) return 4.0;
    return reviews.reduce((sum, r) => sum + (r.metadata?.rating || 0), 0) / reviews.length;
  }

  private calculateAverageResponseTime(providerId: string): number {
    const bookings = db.getBookings().filter(b => b.providerId === providerId);
    if (bookings.length === 0) return 24;

    const responseTimes = bookings
      .filter(b => b.responseTime)
      .map(b => b.responseTime!);

    return responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 24;
  }

  private calculateRepeatCustomerRate(providerId: string): number {
    const bookings = db.getBookings().filter(b => b.providerId === providerId);
    const uniqueCustomers = new Set(bookings.map(b => b.customerId));
    const repeatCustomers = Array.from(uniqueCustomers).filter(customerId => {
      const customerBookings = bookings.filter(b => b.customerId === customerId);
      return customerBookings.length > 1;
    });

    return uniqueCustomers.size > 0 ? repeatCustomers.length / uniqueCustomers.size : 0;
  }

  private getAveragePriceForService(serviceType: string): number {
    const bookings = db.getBookings().filter(b => b.serviceType === serviceType && b.total);
    if (bookings.length === 0) return 500; // Default fallback

    return bookings.reduce((sum, b) => sum + b.total!, 0) / bookings.length;
  }

  private calculateTrend(bookings: Booking[]): 'increasing' | 'stable' | 'decreasing' {
    if (bookings.length < 10) return 'stable';

    const sortedBookings = bookings.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const midpoint = Math.floor(sortedBookings.length / 2);
    const firstHalf = sortedBookings.slice(0, midpoint);
    const secondHalf = sortedBookings.slice(midpoint);

    const firstHalfAvg = firstHalf.length / 15; // 15 days in first half
    const secondHalfAvg = secondHalf.length / 15; // 15 days in second half

    const change = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private assessWeatherRisk(scheduledDate: string): { score: number; factors: string[] } {
    // Simplified weather risk assessment
    const date = new Date(scheduledDate);
    const month = date.getMonth();

    // Monsoon season risk (June-September)
    if (month >= 5 && month <= 8) {
      return {
        score: 15,
        factors: ['Monsoon season may affect outdoor services']
      };
    }

    // Winter season risk (December-February)
    if (month >= 11 || month <= 1) {
      return {
        score: 10,
        factors: ['Winter season may affect service availability']
      };
    }

    return { score: 0, factors: [] };
  }

  private analyzeBusyHours(bookings: Booking[]): string[] {
    const hourCounts = new Array(24).fill(0);

    bookings.forEach(booking => {
      if (booking.scheduledDate) {
        const hour = new Date(booking.scheduledDate).getHours();
        hourCounts[hour]++;
      }
    });

    const maxBookings = Math.max(...hourCounts);
    const busyHours: string[] = [];

    hourCounts.forEach((count, hour) => {
      if (count > maxBookings * 0.7) { // Hours with 70% of max bookings
        busyHours.push(`${hour}:00`);
      }
    });

    return busyHours;
  }
}

export const ai = new AIIntelligenceService();
