import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';

export const healthCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ status: "ok" });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'running'
      }
    });
  }
};
