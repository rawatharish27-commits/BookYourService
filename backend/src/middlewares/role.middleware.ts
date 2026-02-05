import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";

/**
 * 🛡️ AUTHORITY GUARD: DB-Verified RBAC
 * Does not trust the token payload for 'authority'. Queries DB for current role.
 */
export function allowRoles(...roles: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return next({ status: 401, message: "Unauthorized" });

        // 1. Physical DB Check (Authority Source)
        const userRes = await db.query(
            `SELECT r.name as role, u.status 
             FROM users u 
             JOIN roles r ON r.id = u.role_id 
             WHERE u.id = $1`, 
            [userId]
        );

        if (userRes.rowCount === 0) return next({ status: 401, message: "User no longer exists" });
        
        const user = userRes.rows[0];

        // 2. Status Guard
        if (user.status !== 'ACTIVE') {
            return next({ status: 403, message: `Account is ${user.status}. Access revoked.` });
        }

        // 3. Permission Check
        const allowed = Array.isArray(roles[0]) ? roles[0] : roles;
        if (!allowed.includes(user.role)) {
            return next({ status: 403, message: "Forbidden: Insufficient Permissions" });
        }

        next();
    } catch (e) {
        next(e);
    }
  };
}