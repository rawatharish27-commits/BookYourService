
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = randomUUID();
  (req as any).headers["x-request-id"] = requestId;
  (res as any).setHeader("x-request-id", requestId);
  next();
}
