import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  user?: any;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = (req as any).cookies?.access_token || (req as any).headers.authorization?.split(" ")[1];
  if (!token) return next({ status: 401, message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch {
    return next({ status: 401, message: "Invalid token" });
  }
}

/**
 * 🔒 IDOR PROTECTION HELPERS
 */
export function assertClientOwnsBooking(booking: any, userId: string) {
    if (!booking) throw { status: 404, message: "Booking not found" };
    if (booking.client_id !== userId) {
        throw { status: 403, message: "Access Denied: You do not own this resource." };
    }
}

export function assertProviderOwnsBooking(booking: any, providerId: string) {
    if (!booking) throw { status: 404, message: "Booking not found" };
    if (booking.provider_id !== providerId) {
        throw { status: 403, message: "Access Denied: You are not assigned to this booking." };
    }
}