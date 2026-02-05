
import { Router } from "express";
import { reviewController } from "./review.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";

const router = Router();

// CLIENT: Submit Review
router.post(
  "/",
  authenticate,
  allowRoles("CLIENT"),
  reviewController.submit
);

// PUBLIC: List Reviews for a Provider
router.get(
  "/provider/:providerId",
  reviewController.list
);

// Backwards compatibility for existing frontend calls (optional, but good for transition)
router.get(
  "/service/:serviceId",
  async (req, res, next) => {
      // Map serviceId -> providerId lookup if needed, or frontend should switch to providerId
      // For now, we assume frontend logic might need update or we handle redirect
      next(); 
  } 
);

export default router;
