
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

  // Structured Log for alerting systems
  logger.error(err.message || "Internal Server Error", {
    status,
    requestId,
    path: req.path,
    method: req.method,
    stack: env.NODE_ENV !== "production" ? err.stack : undefined,
    errorCode: err.code || 'INTERNAL_ERROR'
  });

  res.status(status).json({
    success: false,
    requestId,
    message: err.message || "An unexpected error occurred",
    code: err.code || 'INTERNAL_ERROR',
    ...(env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}
