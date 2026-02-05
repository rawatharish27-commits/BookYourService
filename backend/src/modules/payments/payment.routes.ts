import { Router } from "express";
import { paymentController } from "./payment.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";
import { enforceIdempotency } from "../../middlewares/idempotency.middleware";

const router = Router();

// Client: Create Order (Idempotency protected)
router.post(
  "/create",
  authenticate,
  allowRoles("CLIENT"),
  enforceIdempotency,
  paymentController.create
);

// Client: Poll Status
router.get(
  "/status/:bookingId",
  authenticate,
  allowRoles("CLIENT"),
  paymentController.getStatus
);

// Webhook (Public)
router.post("/webhook", paymentController.webhook);

export default router;