
import { Router } from "express";
import { authController } from "./auth.controller";
import { loginLimiter } from "../../middlewares/rateLimit.middleware";

const router = Router();

router.post("/login", loginLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Password Reset Flow
router.post("/forgot-password", loginLimiter, authController.forgotPassword);
router.post("/reset-password", loginLimiter, authController.resetPassword);

export default router;
