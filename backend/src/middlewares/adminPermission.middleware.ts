
import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { adminPermissions } from "../config/adminPermissions";

export const requireAdminPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. Basic Role Check
    if (req.user?.role !== 'ADMIN') {
        return (res as any).status(403).json({ message: "Access denied. Admins only." });
    }

    // 2. Level Check
    const adminLevel = req.user.adminLevel || 'ADMIN_L1'; // Default to L1 if not set
    const allowedPermissions = adminPermissions[adminLevel] || [];

    if (!allowedPermissions.includes(permission)) {
      return (res as any).status(403).json({
        message: `Permission denied. Required: ${permission}, Your Level: ${adminLevel}`
      });
    }

    next();
  };
};
