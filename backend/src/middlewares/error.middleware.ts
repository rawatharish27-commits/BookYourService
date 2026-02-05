import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { logger } from "../config/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;
  const requestId = (req as any).headers["x-request-id"] || 'system';

  // 🚨 CRITICAL LOGGING (Internal Only)
  logger.error(`${err.code || 'INTERNAL_ERROR'}: ${err.message}`, {
    status,
    requestId,
    path: req.path,
    method: req.method,
    // NEVER expose stack in prod
    stack: env.NODE_ENV !== "production" ? err.stack : undefined,
    userId: (req as any).user?.id
  });

  // 🎭 MASKED RESPONSE (Client Only)
  res.status(status).json({
    success: false,
    requestId,
    message: status === 500 && env.NODE_ENV === "production" 
      ? "An internal server error occurred. Our team has been notified." 
      : err.message,
    code: err.code || `BYS-${status}-ERR`
  });
}