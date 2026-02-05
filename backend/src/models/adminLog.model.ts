import { db } from "../config/db";
import { PoolClient } from "pg";

export const AdminLogModel = {
  /**
   * Records an administrative action in the audit trail.
   * MUST be called inside a transaction for critical overrides.
   */
  async log(
    adminId: string,
    action: string,
    targetId: string,
    metadata: any = {},
    client?: PoolClient
  ) {
    const executor = client || db;
    await executor.query(
      `INSERT INTO admin_logs (admin_id, action, target_id, metadata)
       VALUES ($1, $2, $3, $4)`,
      [adminId, action, targetId, JSON.stringify(metadata)]
    );
  }
};