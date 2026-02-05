
import { db } from "../../config/db";

export const authRepository = {
  async findUserByEmail(email: string) {
    const result = await db.query(
      `SELECT * FROM "User" WHERE email=$1 AND status='active'`,
      [email]
    );
    return result.rows[0];
  },

  async getUserRoles(userId: string) {
    const result = await db.query(
      `SELECT r.name FROM "UserRole" ur
       JOIN "Role" r ON ur."roleId" = r.id
       WHERE ur."userId" = $1`,
      [userId]
    );
    return result.rows;
  },

  async createSession(data: {
    userId: string;
    refreshTokenHash: string;
    ip: string;
    device: any;
    expiresAt: Date;
  }) {
    // Assuming uuid_generate_v4() is available via extension, or letting DB default handle it if configured.
    // Explicitly using DEFAULT for ID to rely on Schema default (uuid) which is safer if extension varies.
    const result = await db.query(
      `INSERT INTO "Session"
       ("userId", "refreshTokenHash", "ipAddress", "deviceInfo", "expiresAt")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.userId,
        data.refreshTokenHash,
        data.ip,
        data.device,
        data.expiresAt,
      ]
    );
    return result.rows;
  },

  async findSession(sessionId: string) {
    const result = await db.query(
      `SELECT * FROM "Session" WHERE id=$1`,
      [sessionId]
    );
    return result.rows[0];
  },

  async deleteSession(sessionId: string) {
    await db.query(`DELETE FROM "Session" WHERE id=$1`, [sessionId]);
  },
};
