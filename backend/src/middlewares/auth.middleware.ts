import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { db } from "../config/db";

export interface AuthRequest extends Request {
  user?: {
      id: string;
      role: string;
      version: number;
      adminLevel?: string;
  };
}

/**
 * 🛡️ AUTH GATE 2.0: Versioned Session Validator
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = (req as any).cookies?.access_token || (req as any).headers.authorization?.split(" ")[1];
  
  if (!token) return next({ status: 401, message: "Auth required" });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;

    // LAYER 1: Verify version against DB (Prevents ghost sessions)
    const userCheck = await db.query(`SELECT token_version, status FROM users WHERE id = $1`, [payload.id]);
    
    if (userCheck.rowCount === 0 || userCheck.rows[0].status !== 'ACTIVE') {
        return next({ status: 403, message: "Account disabled" });
    }

    if (userCheck.rows[0].token_version !== payload.version) {
        return next({ status: 401, message: "Session invalidated for security. Please login again." });
    }

    (req as any).user = {
        id: payload.id,
        role: payload.role,
        version: payload.version,
        adminLevel: payload.adminLevel
    };
    next();
  } catch (err: any) {
    const msg = err.name === 'TokenExpiredError' ? "Session expired" : "Invalid session";
    return next({ status: 401, message: msg });
  }
}