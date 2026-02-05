
import { Router } from "express";
import { availabilityController } from "./availability.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  allowRoles("PROVIDER"),
  availabilityController.set
);

router.get(
  "/",
  authenticate,
  allowRoles("PROVIDER"),
  availabilityController.list
);

export default router;
