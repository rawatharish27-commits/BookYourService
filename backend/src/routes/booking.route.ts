import { Router } from "express";
import { bookingController } from "../modules/bookings/booking.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { checkBookingFraud } from "../middlewares/fraud.middleware";

const router = Router();

// CLIENT: Create (Protected by Fraud Middleware)
router.post(
  "/",
  authenticate,
  allowRoles("CLIENT"),
  checkBookingFraud,
  bookingController.initiate
);

// PROVIDER: Status Actions
router.post(
  "/:id/accept",
  authenticate,
  allowRoles("PROVIDER"),
  bookingController.accept
);

router.post(
  "/:id/reject",
  authenticate,
  allowRoles("PROVIDER"),
  bookingController.reject
);

router.post(
  "/:id/start",
  authenticate,
  allowRoles("PROVIDER"),
  bookingController.start
);

// PHASE 5: Provider marks as done
router.post(
  "/:id/complete-provider",
  authenticate,
  allowRoles("PROVIDER"),
  async (req, res, next) => {
      try {
          const { bookingService } = await import("../modules/bookings/booking.service");
          await bookingService.markProviderCompleted((req as any).params.id, (req as any).user.id);
          res.json({ success: true });
      } catch (e) { next(e); }
  }
);

// PHASE 5: Customer confirms completion
router.post(
  "/:id/confirm-customer",
  authenticate,
  allowRoles("CLIENT"),
  async (req, res, next) => {
      try {
          const { bookingService } = await import("../modules/bookings/booking.service");
          await bookingService.customerConfirm((req as any).params.id, (req as any).user.id);
          res.json({ success: true });
      } catch (e) { next(e); }
  }
);

router.post(
  "/:id/complete",
  authenticate,
  allowRoles("PROVIDER"),
  bookingController.complete
);

// SHARED: Read
router.get(
    "/my-bookings",
    authenticate,
    allowRoles("CLIENT", "PROVIDER"),
    bookingController.listMyBookings
);

router.get(
    "/:id",
    authenticate,
    allowRoles("CLIENT", "PROVIDER"),
    bookingController.getDetails
);

export default router;