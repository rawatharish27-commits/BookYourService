import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { db } from "../../config/db";
import { env } from "../../config/env";
import { LoginInput } from "./auth.types";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { logger } from "../../utils/logger";
import bcrypt from "bcrypt";

export class AuthService {
  async register(data: any) {
    const { name, email, phone, password, role } = data;
    
    const existing = await db.query(`SELECT id FROM users WHERE email=$1 OR phone=$2`, [email, phone]);
    if (existing.rowCount > 0) {
        throw { status: 409, message: "Email or Phone already registered" };
    }

    const passwordHash = await hashPassword(password);
    const roleRes = await db.query(`SELECT id FROM roles WHERE name=$1`, [role]);
    if (roleRes.rowCount === 0) throw { status: 400, message: "Invalid Role" };
    const roleId = roleRes.rows[0].id;

    const result = await db.query(
        `INSERT INTO users (name, email, phone, password_hash, role_id, status, verification_status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'PENDING')
         RETURNING id`,
        [name, email, phone, passwordHash, roleId]
    );
    
    if (role === 'PROVIDER') {
         await db.query(`INSERT INTO providers (user_id, approval_status) VALUES ($1, 'REGISTERED')`, [result.rows[0].id]);
    }

    return result.rows[0];
  }

  /**
   * 🔐 AUTH HARDENING: Login with Session Tracking & Hash-stored tokens
   */
  async login({ email, password }: LoginInput) {
    const result = await db.query(
        `SELECT u.id, u.name, u.email, u.password_hash, r.name as role, u.status, u.admin_level 
         FROM users u 
         JOIN roles r ON r.id = u.role_id 
         WHERE u.email=$1`,
        [email]
    );

    if (result.rowCount === 0) throw { status: 401, message: "Invalid credentials" };
    const user = result.rows[0];

    if (user.status !== 'ACTIVE') throw { status: 403, message: `Account is ${user.status}` };

    const match = await comparePassword(password, user.password_hash);
    if (!match) throw { status: 401, message: "Invalid credentials" };

    const sessionId = randomBytes(16).toString('hex');
    const accessToken = generateAccessToken({ id: user.id, role: user.role, sid: sessionId, adminLevel: user.admin_level });
    const refreshToken = generateRefreshToken({ id: user.id, sid: sessionId });

    // Store Hashed Refresh Token for security
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await db.query(
        `INSERT INTO sessions (user_id, refresh_token_hash, expires_at) 
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, refreshTokenHash]
    );
    
    return {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }

  /**
   * 🔐 AUTH HARDENING: Token Rotation Logic with Reuse Detection
   */
  async refresh(oldRefreshToken: string) {
    try {
        const payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as any;
        
        // Find active session
        const sessions = await db.query(
            `SELECT id, refresh_token_hash, is_revoked FROM sessions 
             WHERE user_id = $1 AND is_revoked = false AND expires_at > NOW()`,
            [payload.id]
        );

        let validSession = null;
        for (const s of sessions.rows) {
            if (await bcrypt.compare(oldRefreshToken, s.refresh_token_hash)) {
                validSession = s;
                break;
            }
        }

        if (!validSession) {
            // 🚨 REUSE DETECTION: Valid JWT signature but missing from DB
            // Revoke entire token family (all sessions for this user)
            await db.query(`UPDATE sessions SET is_revoked = true WHERE user_id = $1`, [payload.id]);
            logger.error(`SECURITY ALERT: Refresh token reuse detected for user ${payload.id}. All sessions revoked.`);
            throw new Error("Potential token reuse detected.");
        }

        const userRes = await db.query(
            `SELECT u.id, u.admin_level, r.name as role FROM users u 
             JOIN roles r ON r.id = u.role_id 
             WHERE u.id = $1 AND u.status = 'ACTIVE'`, 
            [payload.id]
        );
        if (userRes.rowCount === 0) throw new Error("User no longer active.");
        const user = userRes.rows[0];

        // ROTATION: Generate fresh pair
        const newAccessToken = generateAccessToken({ id: user.id, role: user.role, adminLevel: user.admin_level });
        const newRefreshToken = generateRefreshToken({ id: user.id });
        const newHash = await bcrypt.hash(newRefreshToken, 10);

        await db.query(
            `UPDATE sessions SET refresh_token_hash = $1, created_at = NOW() WHERE id = $2`,
            [newHash, validSession.id]
        );

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (e: any) {
        throw { status: 401, message: e.message || "Invalid session" };
    }
  }

  async logout(userId: string, refreshToken?: string) {
     if (refreshToken) {
         // Revoke specific session by matching hash
         const sessions = await db.query(`SELECT id, refresh_token_hash FROM sessions WHERE user_id=$1 AND is_revoked=false`, [userId]);
         for (const s of sessions.rows) {
             if (await bcrypt.compare(refreshToken, s.refresh_token_hash)) {
                 await db.query(`UPDATE sessions SET is_revoked = true WHERE id = $1`, [s.id]);
                 break;
             }
         }
     } else {
         // Global logout for all devices
         await db.query(`UPDATE sessions SET is_revoked = true WHERE user_id = $1`, [userId]);
     }
  }

  async forgotPassword(email: string) {
      const userRes = await db.query(`SELECT id FROM users WHERE email=$1`, [email]);
      if (userRes.rowCount === 0) return; 

      const userId = userRes.rows[0].id;
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = await hashPassword(rawToken); 
      
      await db.query(
          `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
          [userId, tokenHash]
      );

      logger.info(`[MOCK EMAIL] Reset for ${email}: ${rawToken}`);
  }

  async resetPasswordWithId(userId: string, token: string, newPassword: string) {
      const result = await db.query(
          `SELECT id, token_hash FROM password_resets 
           WHERE user_id=$1 AND used=false AND expires_at > NOW() 
           ORDER BY created_at DESC LIMIT 1`,
          [userId]
      );

      if (result.rowCount === 0) throw { status: 400, message: "Link expired" };
      const match = await comparePassword(token, result.rows[0].token_hash);
      if (!match) throw { status: 400, message: "Invalid token" };

      const newHash = await hashPassword(newPassword);
      await db.transaction(async (client) => {
          await client.query(`UPDATE users SET password_hash=$1 WHERE id=$2`, [newHash, userId]);
          await client.query(`UPDATE password_resets SET used=true WHERE id=$3`, [result.rows[0].id]);
          await client.query(`UPDATE sessions SET is_revoked=true WHERE user_id=$1`, [userId]);
      });
  }
}

export const authService = new AuthService();