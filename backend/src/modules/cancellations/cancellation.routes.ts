
import { Router } from "express";
import { cancellationController } from "./cancellation.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";

const router = Router();

router.post(
  "/:id/client",
  authenticate,
  allowRoles("CLIENT"),
  cancellationController.clientCancel
);

router.post(
  "/:id/provider",
  authenticate,
  allowRoles("PROVIDER"),
  cancellationController.providerCancel
);

export default router;
