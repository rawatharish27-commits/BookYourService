import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";
import { AuthRequest } from "./auth.middleware";

/**
 * 🛡️ IDEMPOTENCY GUARD
 * Prevents double-spending by caching responses for unique keys.
 */
export const enforceIdempotency = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const r = req as any;
  const key = r.headers['x-idempotency-key'] as string;
  const userId = r.user?.id;

  if (!key || !userId) return next();

  try {
    // 1. Check for existing key
    const existing = await db.query(
      `SELECT response_code, response_body FROM idempotency_keys 
       WHERE idempotency_key = $1 AND user_id = $2 AND endpoint = $3 AND expires_at > NOW()`,
      [key, userId, r.originalUrl]
    );

    if (existing.rowCount > 0) {
      const { response_code, response_body } = existing.rows[0];
      if (response_code) {
        return res.status(response_code).json(response_body);
      }
      return res.status(409).json({ message: "Request already in progress." });
    }

    // 2. Register key (Atomic Lock)
    await db.query(
      `INSERT INTO idempotency_keys (idempotency_key, user_id, endpoint, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')`
    , [key, userId, r.originalUrl]);

    // 3. Intercept response
    const originalJson = res.json;
    res.json = function (body: any) {
      db.query(
        `UPDATE idempotency_keys SET response_code = $1, response_body = $2 
         WHERE idempotency_key = $3 AND user_id = $4`,
        [res.statusCode, JSON.stringify(body), key, userId]
      ).catch(err => console.error("Idempotency update failed", err));
      
      return originalJson.call(this, body);
    };

    next();
  } catch (e) {
    next(e);
  }
};