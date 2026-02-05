
import { Router } from "express";
import { register, login, refresh, logout, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { loginLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/refresh", refresh); // No schema needed, pulls from cookie
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

export default router;
