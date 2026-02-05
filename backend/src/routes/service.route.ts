
import { Router } from "express";
import {
  createService,
  updateService,
  approveService,
  listServices,
  getMyServices,
  getAllServicesAdmin,
  rejectService
} from "../controllers/service.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

// PUBLIC
router.get("/", listServices);

// PROVIDER
router.get(
  "/my-services",
  authenticate,
  allowRoles("PROVIDER"),
  getMyServices
);

router.post(
  "/",
  authenticate,
  allowRoles("PROVIDER"),
  createService
);

router.put(
  "/:id",
  authenticate,
  allowRoles("PROVIDER"),
  updateService
);

// ADMIN
router.get(
  "/admin/all",
  authenticate,
  allowRoles("ADMIN"),
  getAllServicesAdmin
);

router.post(
  "/:id/approve",
  authenticate,
  allowRoles("ADMIN"),
  approveService
);

router.post(
  "/:id/reject",
  authenticate,
  allowRoles("ADMIN"),
  rejectService
);

export default router;
