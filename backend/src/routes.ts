import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import providerRoutes from "./modules/providers/provider.routes";
import availabilityRoutes from "./modules/availability/availability.routes";
import categoryRoutes from "./routes/category.route";
import catalogRoutes from "./routes/catalog.route";
import serviceRoutes from "./routes/service.route";
import bookingRoutes from "./modules/bookings/booking.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import cancellationRoutes from "./modules/cancellations/cancellation.routes";
import reviewRoutes from "./modules/reviews/review.routes";
import adminRoutes from "./modules/admin/admin.routes";
import disputeRoutes from "./modules/disputes/dispute.routes";
import sitemapRoutes from "./routes/sitemap.route"; // Added
import { publicController } from "./controllers/public.controller";

const router = Router();

// 🗺️ PUBLIC SEO
router.use("/sitemap.xml", sitemapRoutes);

// 🛠️ API Version 1
router.use("/v1/auth", authRoutes);
router.use("/v1/users", userRoutes);
router.use("/v1/provider", providerRoutes);
router.use("/v1/provider/availability", availabilityRoutes); 
router.use("/v1/categories", categoryRoutes);
router.use("/v1/catalog", catalogRoutes);
router.use("/v1/services", serviceRoutes);
router.use("/v1/bookings", bookingRoutes);
router.use("/v1/payments", paymentRoutes);
router.use("/v1/cancellations", cancellationRoutes);
router.use("/v1/reviews", reviewRoutes);
router.use("/v1/admin", adminRoutes);
router.use("/v1/disputes", disputeRoutes);

router.get("/v1/public/stats", publicController.getPublicStats);

export default router;