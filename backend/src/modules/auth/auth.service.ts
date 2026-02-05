import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { db } from "../../config/db";
import { env } from "../../config/env";
import { LoginInput } from "./auth.types";
// Added hashPassword to imports
import { comparePassword, hashPassword } from "../../utils/password";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

export class AuthService {
  /**
   * 🔐 HARDENED LOGIN
   * Uses token_version to enable instant session invalidation across all devices.
   */
  async login({ email, password }: LoginInput) {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.password_hash, r.name as role, u.status, u.token_version, u.admin_level 
       FROM users u 
       JOIN roles r ON r.id = u.role_id 
       WHERE u.email=$1`,
      [email]
    );

    if (result.rowCount === 0) throw { status: 401, message: "Invalid credentials" };
    const user = result.rows[0];

    if (user.status !== 'ACTIVE') throw { status: 403, message: `Account is ${user.status}. Contact support.` };

    const match = await comparePassword(password, user.password_hash);
    if (!match) throw { status: 401, message: "Invalid credentials" };

    // JWT payload now includes tokenVersion for Layer 1 validation
    const accessToken = generateAccessToken({ 
      id: user.id, 
      role: user.role, 
      version: user.token_version,
      adminLevel: user.admin_level 
    });
    
    const refreshToken = generateRefreshToken({ id: user.id, version: user.token_version });

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, tokenHash]
    );
    
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }

  /**
   * 🔄 REFRESH WITH VERSION CHECK
   */
  async refresh(oldRefreshToken: string) {
    try {
      const payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as any;
      const oldHash = createHash('sha256').update(oldRefreshToken).digest('hex');

      const tokenCheck = await db.query(
        `SELECT rt.id, u.token_version 
         FROM refresh_tokens rt
         JOIN users u ON u.id = rt.user_id
         WHERE rt.user_id = $1 AND rt.token_hash = $2 AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
        [payload.id, oldHash]
      );

      // If token version in JWT doesn't match DB, the session was invalidated
      if (tokenCheck.rowCount === 0 || tokenCheck.rows[0].token_version !== payload.version) {
        throw new Error("Session expired or security breach detected. Please re-login.");
      }

      const userRes = await db.query(
        `SELECT u.id, u.admin_level, u.token_version, r.name as role FROM users u 
         JOIN roles r ON r.id = u.role_id 
         WHERE u.id = $1 AND u.status = 'ACTIVE'`, 
        [payload.id]
      );
      
      const user = userRes.rows[0];
      await db.query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1`, [tokenCheck.rows[0].id]);

      const accessToken = generateAccessToken({ id: user.id, role: user.role, version: user.token_version, adminLevel: user.admin_level });
      const refreshToken = generateRefreshToken({ id: user.id, version: user.token_version });
      const newHash = createHash('sha256').update(refreshToken).digest('hex');

      await db.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [user.id, newHash]
      );

      return { accessToken, refreshToken };
    } catch (e: any) {
      throw { status: 401, message: e.message || "Session invalid" };
    }
  }

  // FIX: Added register method to resolve auth.controller error
  async register(data: any) {
    const { name, email, phone, password, role } = data;
    const hashedPassword = await hashPassword(password);
    
    const roleRes = await db.query(`SELECT id FROM roles WHERE name=$1`, [role]);
    if (roleRes.rowCount === 0) throw { status: 400, message: "Invalid role" };

    const result = await db.query(
      `INSERT INTO users (name, email, phone, password_hash, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, email, phone, hashedPassword, roleRes.rows[0].id]
    );
    return result.rows[0];
  }

  // FIX: Added logout method to resolve auth.controller error
  async logout(refreshToken: string) {
    const oldHash = createHash('sha256').update(refreshToken).digest('hex');
    await db.query(
      `UPDATE refresh_tokens SET revoked_at = NOW() 
       WHERE token_hash = $1`,
      [oldHash]
    );
  }

  /**
   * 🧨 GLOBAL LOGOUT (Increase version)
   */
  async logoutGlobally(userId: string) {
    await db.transaction(async (client) => {
        await client.query(`UPDATE users SET token_version = token_version + 1 WHERE id = $1`, [userId]);
        await client.query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1`, [userId]);
    });
  }
}

export const authService = new AuthService();