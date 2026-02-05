
import { Request, Response } from "express";
import { db } from "../../config/db";
import { logger } from "../../config/logger";

export const healthController = {
  /**
   * Deep Health Check
   * Checks DB connectivity and basic system resources.
   */
  async check(req: Request, res: Response) {
    const start = Date.now();
    let dbStatus = "UP";
    let dbLatency = 0;

    try {
      const dbStart = Date.now();
      await db.query("SELECT 1");
      dbLatency = Date.now() - dbStart;
    } catch (e: any) {
      dbStatus = "DOWN";
      logger.error("Health Check: DB failure", { error: e.message });
    }

    const sysMetrics = {
      // Fix: Cast process to any to resolve property visibility issues in strict TS environments
      uptime: (process as any).uptime(),
      memory: (process as any).memoryUsage(),
      cpu: (process as any).cpuUsage(),
    };

    const isHealthy = dbStatus === "UP";

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      timestamp: new Date().toISOString(),
      latency_ms: Date.now() - start,
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`
        },
        api: "UP"
      },
      system: sysMetrics
    });
  }
};