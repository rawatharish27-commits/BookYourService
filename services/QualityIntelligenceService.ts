
import { db } from './DatabaseService';

class QualityIntelligenceService {
  async updateQualityScore(providerId: string) {
    const user = db.getUsers().find(u => u.id === providerId);
    if (user) {
      user.qualityScore = Math.min(100, (user.qualityScore || 80) + 1);
      db.save();
    }
  }
}

export const qualityService = new QualityIntelligenceService();
