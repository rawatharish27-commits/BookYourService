
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { db } from "../../config/db";
import { env } from "../../config/env";
import { LoginInput, JwtPayload } from "./auth.types";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { logger } from "../../utils/logger";

export class AuthService {
  async register(data: any) {
    const { name, email, phone, password, role } = data;
    
    // Check if user exists
    const existing = await db.query(`SELECT id FROM users WHERE email=$1 OR phone=$2`, [email, phone]);
    if (existing.rowCount > 0) {
        throw { status: 409, message: "User already exists" };
    }

    const passwordHash = await hashPassword(password);
    
    // Get role ID
    const roleRes = await db.query(`SELECT id FROM roles WHERE name=$1`, [role]);
    if (roleRes.rowCount === 0) throw { status: 400, message: "Invalid Role" };
    const roleId = roleRes.rows[0].id;

    const result = await db.query(
        `INSERT INTO users (name, email, phone, password_hash, role_id, status, verification_status, email_verified)
         VALUES ($1, $2, $3, $4, $5, 'active', 'PENDING', false)
         RETURNING id`,
        [name, email, phone, passwordHash, roleId]
    );
    
    // Initialize Provider profile if role is PROVIDER
    if (role === 'PROVIDER') {
         await db.query(`INSERT INTO providers (user_id, approval_status) VALUES ($1, 'REGISTERED')`, [result.rows[0].id]);
    }

    return result.rows[0];
  }

  async login({ email, password }: LoginInput) {
    const result = await db.query(
        `SELECT u.id, u.name, u.email, u.password_hash, r.name as role, u.status 
         FROM users u 
         JOIN roles r ON r.id = u.role_id 
         WHERE u.email=$1`,
        [email]
    );

    if (result.rowCount === 0) throw { status: 401, message: "Invalid credentials" };
    const user = result.rows[0];

    if (user.status === 'SUSPENDED' || user.status === 'DELETED') throw { status: 403, message: "Account suspended or deleted" };

    const match = await comparePassword(password, user.password_hash);
    if (!match) throw { status: 401, message: "Invalid credentials" };

    const payload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
  }

  async refresh(refreshToken: string) {
    try {
        const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
        
        // Verify user exists
        const userRes = await db.query(`SELECT id, role_id, status FROM users WHERE id=$1`, [payload.id]);
        if (userRes.rowCount === 0) throw new Error("User not found");
        const user = userRes.rows[0];

        if (user.status === 'SUSPENDED') throw new Error("Account suspended");
        
        // Get Role Name
        const roleRes = await db.query(`SELECT name FROM roles WHERE id=$1`, [user.role_id]);
        const role = roleRes.rows[0].name;

        const newPayload = { id: user.id, role };
        
        return {
            accessToken: generateAccessToken(newPayload),
            refreshToken: generateRefreshToken(newPayload) // Rotate
        };
    } catch (e) {
        throw { status: 401, message: "Invalid refresh token" };
    }
  }

  async logout(sessionId?: string) {
     // Stateless JWT logout (client-side clears cookie)
     // Optional: Blacklist token in Redis
  }

  // --- PASSWORD RESET FLOW ---

  async forgotPassword(email: string) {
      const userRes = await db.query(`SELECT id FROM users WHERE email=$1`, [email]);
      if (userRes.rowCount === 0) return; // Silent fail for security

      const userId = userRes.rows[0].id;
      
      // Generate secure token
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = await hashPassword(rawToken); // Store hashed version
      
      // Expire in 1 hour
      await db.query(
          `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
          [userId, tokenHash]
      );

      // In real prod: await emailService.sendResetEmail(email, rawToken);
      logger.info(`[MOCK EMAIL] Password Reset Token for ${email}: ${rawToken}`);
  }

  async resetPassword(token: string, newPassword: string) {
      // Find all active reset requests (naive approach for MVP, better to search by user flow usually, but here we scan valid tokens for matching hash)
      // Since hashing is one-way, we iterate recent tokens or user provides email + token. 
      // For higher security, flow should be: Link contains ID + Token.
      // Assuming Frontend sends { token, newPassword } -> We can't find DB row easily without ID.
      // FIX: Request must include Email or UserID, OR we store plain token (less secure).
      // ALTERNATIVE: Store token=RandomUUID (indexed), but hash it?
      // Let's assume the link is ?token=RAW_TOKEN&id=USER_ID
      throw { status: 400, message: "Reset requires user ID logic. Please implement full link structure." };
  }

  // Improved Implementation with UserID
  async resetPasswordWithId(userId: string, token: string, newPassword: string) {
      const result = await db.query(
          `SELECT id, token_hash, expires_at, used FROM password_resets 
           WHERE user_id=$1 AND used=false AND expires_at > NOW() 
           ORDER BY created_at DESC LIMIT 1`,
          [userId]
      );

      if (result.rowCount === 0) throw { status: 400, message: "Invalid or expired token" };
      const resetRecord = result.rows[0];

      const match = await comparePassword(token, resetRecord.token_hash);
      if (!match) throw { status: 400, message: "Invalid token" };

      const newHash = await hashPassword(newPassword);
      
      await db.transaction(async (client) => {
          await client.query(`UPDATE users SET password_hash=$1 WHERE id=$2`, [newHash, userId]);
          await client.query(`UPDATE password_resets SET used=true WHERE id=$3`, [resetRecord.id]);
          // Revoke all sessions (optional but recommended)
          // await client.query(`UPDATE sessions SET is_revoked=true WHERE user_id=$1`, [userId]);
      });
  }
}

export const authService = new AuthService();
