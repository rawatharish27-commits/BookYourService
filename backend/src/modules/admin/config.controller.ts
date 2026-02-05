import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { db } from "../../config/db";

export const configController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await db.query(`SELECT * FROM system_configs ORDER BY key ASC`);
      (res as any).json(result.rows);
    } catch (e) { next(e); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key, value, description } = (req as any).body;
      await db.query(
        `INSERT INTO system_configs (key, value, description, updated_by_admin_id, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (key) DO UPDATE SET 
            value = EXCLUDED.value, 
            description = COALESCE(EXCLUDED.description, system_configs.description),
            updated_by_admin_id = EXCLUDED.updated_by_admin_id,
            updated_at = NOW()`,
        [key, value, description, req.user!.id]
      );
      (res as any).json({ success: true, message: `System configuration '${key}' updated.` });
    } catch (e) { next(e); }
  }
};