import { db } from "../config/db";
import { PoolClient } from "pg";

export type AuditTargetType = 'USER' | 'SERVICE' | 'BOOKING' | 'CONFIG' | 'DISPUTE' | 'PAYMENT';

export const AdminLogModel = {
  /**
   * Records an immutable administrative action in the audit trail.
   * PHASE 7 Compliance: Mandatory for all non-read admin routes.
   */
  async log(
    adminId: string,
    actionType: string,
    targetType: AuditTargetType,
    targetId: string,
    payload: any = {},
    client?: PoolClient
  ) {
    const executor = client || db;
    try {
      await executor.query(
        `INSERT INTO admin_audit_logs (admin_id, action_type, target_type, target_id, payload)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminId, actionType, targetType, targetId, JSON.stringify(payload)]
      );
    } catch (e) {
      // We don't throw here to avoid rolling back critical business transactions 
      // just because logging failed, but we must log the failure to console.
      console.error("FATAL: Admin Audit Log insertion failed", e);
    }
  }
};