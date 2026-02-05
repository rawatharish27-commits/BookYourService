import { Router } from "express";
import { authController } from "./auth.controller";
import { passwordController } from "./password.controller";
import { loginLimiter } from "../../middlewares/rateLimit.middleware";
import { auditLogin } from "../../middlewares/audit.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { loginSchema } from "../../schemas/auth.schema";

const router = Router();

// Standard Auth
router.post("/login", loginLimiter, auditLogin, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Password Management
router.post("/forgot-password", loginLimiter, passwordController.forgotPassword);
router.post("/reset-password", loginLimiter, passwordController.resetPassword);

export default router;