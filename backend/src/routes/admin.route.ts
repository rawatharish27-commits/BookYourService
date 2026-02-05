import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { providerApprovalController } from "../modules/admin/providerApproval.controller";
import { disputeController } from "../modules/disputes/dispute.controller";
import { configController } from "../modules/admin/config.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { adminLimiter } from "../middlewares/rateLimit.middleware";
import { auditAdminAction } from "../middlewares/adminAudit.middleware";

const router = Router();

router.use(authenticate, allowRoles("ADMIN"), adminLimiter);

// Provider Verification
router.get("/providers/pending", providerApprovalController.listPending);
router.get("/providers/:id", providerApprovalController.getDetails);
router.post("/providers/:id/approve", auditAdminAction('USER'), providerApprovalController.approve);

// Disputes
router.get("/disputes", disputeController.listForAdmin);
router.post("/disputes/:id/resolve", auditAdminAction('DISPUTE'), disputeController.resolve);

// Financial Operations
router.post("/payout/process", auditAdminAction('PAYMENT'), adminController.payoutProvider);

// System Management
router.get("/config", configController.list);
router.put("/config", auditAdminAction('CONFIG'), configController.update);

// Logging
router.get("/audit-logs", adminController.getAuditLogs);

export default router;