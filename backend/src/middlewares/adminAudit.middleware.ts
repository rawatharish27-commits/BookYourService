import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { AdminLogModel } from "../models/adminLog.model";

/**
 * 🕵️ ADMIN ACTION AUDITOR
 */
export const auditAdminAction = (targetType: 'USER' | 'SERVICE' | 'BOOKING' | 'CONFIG' | 'PAYMENT' | 'DISPUTE') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    const adminId = req.user!.id;
    const r = req as any;
    const ipAddress = r.ip || r.socket.remoteAddress || 'unknown';
    
    res.json = function (data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const actionType = `${r.method}_${r.baseUrl.split('/').pop()?.toUpperCase()}`;
        const targetId = r.params.id || r.body.providerId || r.body.bookingId || 'SYSTEM';

        AdminLogModel.log(
          adminId,
          actionType,
          targetType,
          targetId,
          { body: r.body, query: r.query, ip: ipAddress }
        ).catch(err => console.error("Admin audit logging failed", err));
      }
      return originalJson.call(this, data);
    };

    next();
  };
};