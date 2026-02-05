
import { Router } from "express";
import { providerController } from "./provider.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";

const router = Router();

// Provider Self-Service
router.post("/apply", authenticate, providerController.apply);
router.post("/kyc", authenticate, allowRoles("PROVIDER"), providerController.submitKyc);
router.get("/status", authenticate, allowRoles("PROVIDER"), providerController.getMyStatus);
router.post("/request-go-live", authenticate, allowRoles("PROVIDER"), providerController.requestGoLive);

// Admin Actions
router.post(
  "/:id/approve",
  authenticate,
  allowRoles("ADMIN"),
  providerController.approve
);

router.post(
  "/:id/go-live",
  authenticate,
  allowRoles("ADMIN"),
  providerController.goLive
);

export default router;
