
import { Router } from "express";
import { disputeController } from "./dispute.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", disputeController.create);
router.get("/my", disputeController.getMyDisputes);

export default router;
