
import { Router } from "express";
// Fix: Import adminController as an object since it is exported as such
import { adminController } from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { requireAdminPermission } from "../middlewares/adminPermission.middleware";
import { adminLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

// 1. Global Admin Protection
router.use(authenticate, allowRoles("ADMIN"), adminLimiter);

// 2. Operational Routes (L1+)
// Fix: Map routes to adminController methods
router.get("/dashboard", adminController.getDashboardStats);
router.get("/metrics", adminController.getSystemMetrics); // Monitoring Endpoint
router.get("/providers-wallet", adminController.getProvidersWithWallet);
router.get("/config", requireAdminPermission("MANAGE_CONFIG"), adminController.getSystemConfig);
router.get("/disputes", requireAdminPermission("RESOLVE_DISPUTE"), adminController.listDisputes);

// 3. Action Routes (Permission Gated)
router.post("/config", requireAdminPermission("MANAGE_CONFIG"), adminController.updateSystemConfig);
router.post("/disputes/resolve", requireAdminPermission("RESOLVE_DISPUTE"), adminController.resolveDispute);

router.post("/provider/verify", requireAdminPermission("APPROVE_SERVICE"), adminController.verifyProvider); // Using APPROVE_SERVICE level for now

router.post(
    "/provider/payout",
    requireAdminPermission("REFUND_TRIGGER"), 
    adminController.payoutProvider
);

// 4. Emergency/Override Routes
// Fix: Map legacy names to valid adminController methods
router.post("/user/status", requireAdminPermission("BLOCK_USER"), adminController.suspendProvider);
router.post("/booking/override", requireAdminPermission("BOOKING_OVERRIDE"), adminController.forceCancel);
router.post("/booking/cancel", requireAdminPermission("ADMIN_CANCEL_BOOKING"), adminController.forceCancel);
router.post("/refund", requireAdminPermission("REFUND_TRIGGER"), adminController.forceRefund);

export default router;
