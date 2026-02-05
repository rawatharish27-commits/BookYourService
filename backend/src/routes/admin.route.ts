
import { Router } from "express";
import {
  updateUserStatus,
  overrideBookingStatus,
  triggerRefund,
  adminCancelBooking,
  verifyProvider,
  payoutProvider,
  getDashboardStats,
  getProvidersWithWallet,
  getSystemMetrics,
  getSystemConfig,
  updateSystemConfig,
  getDisputes,
  resolveDispute
} from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { requireAdminPermission } from "../middlewares/adminPermission.middleware";
import { adminLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

// 1. Global Admin Protection
router.use(authenticate, allowRoles("ADMIN"), adminLimiter);

// 2. Operational Routes (L1+)
router.get("/dashboard", getDashboardStats);
router.get("/metrics", getSystemMetrics); // Monitoring Endpoint
router.get("/providers-wallet", getProvidersWithWallet);
router.get("/config", requireAdminPermission("MANAGE_CONFIG"), getSystemConfig);
router.get("/disputes", requireAdminPermission("RESOLVE_DISPUTE"), getDisputes);

// 3. Action Routes (Permission Gated)
router.post("/config", requireAdminPermission("MANAGE_CONFIG"), updateSystemConfig);
router.post("/disputes/resolve", requireAdminPermission("RESOLVE_DISPUTE"), resolveDispute);

router.post("/provider/verify", requireAdminPermission("APPROVE_SERVICE"), verifyProvider); // Using APPROVE_SERVICE level for now

router.post(
    "/provider/payout",
    requireAdminPermission("REFUND_TRIGGER"), 
    payoutProvider
);

// 4. Emergency/Override Routes
router.post("/user/status", requireAdminPermission("BLOCK_USER"), updateUserStatus);
router.post("/booking/override", requireAdminPermission("BOOKING_OVERRIDE"), overrideBookingStatus);
router.post("/booking/cancel", requireAdminPermission("ADMIN_CANCEL_BOOKING"), adminCancelBooking);
router.post("/refund", requireAdminPermission("REFUND_TRIGGER"), triggerRefund);

export default router;
