
import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authenticate, userController.me);

export default router;
