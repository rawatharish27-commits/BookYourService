
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  user?: {
      id: string;
      role: string;
      sid?: string;
      // Added adminLevel to satisfy permission checks in downstream middlewares
      adminLevel?: string;
  };
}

/**
 * 🛡️ AUTH GATE: Access Token Validator
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // Priority: Cookie -> Header
  const token = (req as any).cookies?.access_token || (req as any).headers.authorization?.split(" ")[1];
  
  if (!token) {
      return next({ status: 401, message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;
    (req as any).user = {
        id: payload.id,
        role: payload.role,
        sid: payload.sid,
        // Populate adminLevel from payload to enable RBAC/Level checks
        adminLevel: payload.adminLevel
    };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
        return next({ status: 401, message: "Token expired", code: 'TOKEN_EXPIRED' });
    }
    return next({ status: 401, message: "Invalid session" });
  }
}

/**
 * 🔒 IDOR PROTECTION HELPERS
 */
export function assertClientOwnsBooking(booking: any, userId: string) {
    if (!booking) throw { status: 404, message: "Booking not found" };
    if (booking.client_id !== userId) {
        throw { status: 403, message: "IDOR Attempt: Resource ownership mismatch." };
    }
}

export function assertProviderOwnsBooking(booking: any, providerId: string) {
    if (!booking) throw { status: 404, message: "Booking not found" };
    if (booking.provider_id !== providerId) {
        throw { status: 403, message: "IDOR Attempt: Assigned provider mismatch." };
    }
}
