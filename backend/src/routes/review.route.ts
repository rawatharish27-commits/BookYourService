
import { Router } from "express";
import { 
    addReview, 
    getReviewsByService, 
    replyToReview,
    getFlaggedReviews,
    moderateReview
} from "../controllers/review.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

// Public
router.get("/service/:serviceId", getReviewsByService);

// Client
router.post("/", authenticate, allowRoles("CLIENT"), addReview);

// Provider
router.post("/reply", authenticate, allowRoles("PROVIDER"), replyToReview);

// Admin
router.get("/admin/flagged", authenticate, allowRoles("ADMIN"), getFlaggedReviews);
router.post("/admin/moderate", authenticate, allowRoles("ADMIN"), moderateReview);

export default router;
