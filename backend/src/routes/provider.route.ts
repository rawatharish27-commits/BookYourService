
import { Router } from "express";
import { 
    setAvailability, 
    getAvailability, 
    getWallet,
    applyAsProvider,
    submitKYC,
    getOnboardingStatus,
    requestGoLive
} from "../controllers/provider.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

// Apply (Can be CLIENT)
router.post("/apply", authenticate, applyAsProvider);

// Onboarding & Dashboard (Requires PROVIDER or CLIENT converting to Provider)
// Note: applyAsProvider updates role to PROVIDER.
router.use(authenticate, allowRoles("PROVIDER"));

router.get("/onboarding/status", getOnboardingStatus);
router.post("/onboarding/kyc", submitKYC);
router.post("/onboarding/golive", requestGoLive);

router.get("/availability", getAvailability);
router.post("/availability", setAvailability);
router.get("/wallet", getWallet);

export default router;
