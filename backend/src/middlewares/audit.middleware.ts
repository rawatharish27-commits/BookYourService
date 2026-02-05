import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";

/**
 * 🕵️ LOGIN AUDITOR
 * Records success/failure of every authentication attempt.
 */
export const auditLogin = async (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const email = (req as any).body?.email;

  // Intercept the response to log the outcome
  res.json = function (data: any) {
    const success = res.statusCode === 200;
    
    // Fire and forget audit log (don't block the response)
    db.query(
      `INSERT INTO login_audits (user_id, ip_address, user_agent, success)
       SELECT id, $2, $3, $4 FROM users WHERE email = $1`,
      [email, ipAddress, userAgent, success]
    ).catch(err => console.error("Audit log failed", err));

    return originalJson.call(this, data);
  };

  next();
};