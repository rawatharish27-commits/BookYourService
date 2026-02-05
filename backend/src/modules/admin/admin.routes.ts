
import { Router } from "express";
import { adminController } from "./admin.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";
import { requireAdminPermission } from "../../middlewares/adminPermission.middleware";

const router = Router();

// 1. GLOBAL GUARD: Must be authenticated AND have 'ADMIN' role
router.use(authenticate, allowRoles("ADMIN"));

// 2. DASHBOARD & READ-ONLY (L1 Permissions)
router.get("/dashboard", requireAdminPermission("VIEW_BOOKINGS"), adminController.getDashboardStats);
router.get("/metrics", requireAdminPermission("VIEW_BOOKINGS"), adminController.getSystemMetrics);
router.get("/providers-wallet", requireAdminPermission("VIEW_USERS"), adminController.getProvidersWithWallet);
router.get("/config", requireAdminPermission("MANAGE_CONFIG"), adminController.getSystemConfig);
router.get("/disputes", requireAdminPermission("RESOLVE_DISPUTE"), adminController.listDisputes);

// 3. PROVIDER MANAGEMENT
router.post(
  "/providers/:providerId/suspend",
  requireAdminPermission("BLOCK_USER"),
  adminController.suspendProvider
);

router.post(
  "/provider/verify",
  requireAdminPermission("APPROVE_SERVICE"), // L2+
  adminController.verifyProvider
);

router.post(
  "/provider/payout",
  requireAdminPermission("REFUND_TRIGGER"), // L4 (High Risk)
  adminController.payoutProvider
);

// 4. BOOKING MANAGEMENT (Overrides)
// Fix: changed parameter to :id and method to forceCancel to match adminController.forceCancel
router.post(
  "/bookings/:id/cancel",
  requireAdminPermission("ADMIN_CANCEL_BOOKING"),
  adminController.forceCancel
);

// Fix: changed parameter to :id and method to forceRefund to match adminController.forceRefund
router.post(
  "/bookings/:id/refund",
  requireAdminPermission("REFUND_TRIGGER"),
  adminController.forceRefund
);

// 5. SYSTEM CONFIG & DISPUTES
router.post(
  "/config",
  requireAdminPermission("MANAGE_CONFIG"),
  adminController.updateSystemConfig
);

router.post(
  "/disputes/resolve",
  requireAdminPermission("RESOLVE_DISPUTE"),
  adminController.resolveDispute
);

export default router;
