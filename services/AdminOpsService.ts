
import { db } from './DatabaseService';

class AdminOpsService {
  getOpsStats() {
    return {
      revenueToday: 1200,
      slaBreaches: 2
    };
  }
}

export const adminOps = new AdminOpsService();
