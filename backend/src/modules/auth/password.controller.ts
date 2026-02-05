import { Request, Response, NextFunction } from "express";
import { db } from "../../config/db";
import { randomBytes, createHash } from "crypto";
import { hashPassword } from "../../utils/password";
import { logger } from "../../utils/logger";

export const passwordController = {
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = (req as any).body;
      const userRes = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
      
      if (userRes.rowCount === 0) {
        // Return 200 regardless to prevent user enumeration
        return (res as any).json({ message: "If an account exists with this email, a reset link has been sent." });
      }

      const userId = userRes.rows[0].id;
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');

      await db.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
        [userId, tokenHash]
      );

      // In production, trigger Email Service here
      logger.info(`[MOCK EMAIL] Password reset token for ${email}: ${token}`);

      (res as any).json({ message: "Reset link sent successfully." });
    } catch (e) { next(e); }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = (req as any).body;
      const tokenHash = createHash('sha256').update(token).digest('hex');

      const tokenRes = await db.query(
        `SELECT id, user_id FROM password_reset_tokens 
         WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
        [tokenHash]
      );

      if (tokenRes.rowCount === 0) {
        return (res as any).status(400).json({ message: "Invalid or expired reset token." });
      }

      const { id: tokenId, user_id: userId } = tokenRes.rows[0];
      const newHash = await hashPassword(newPassword);

      await db.transaction(async (client) => {
        // 1. Update Password
        await client.query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [newHash, userId]);
        // 2. Mark token as used
        await client.query(`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`, [tokenId]);
        // 3. Revoke all active sessions for this user for safety
        await client.query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1`, [userId]);
      });

      (res as any).json({ message: "Password updated successfully. Please login with your new password." });
    } catch (e) { next(e); }
  }
};