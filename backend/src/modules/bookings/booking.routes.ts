
import { Router } from "express";
import { bookingController } from "./booking.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { allowRoles } from "../../middlewares/role.middleware";
import { checkBookingFraud } from "../../middlewares/fraud.middleware";
import { bookingSSE } from "../../sse/booking.sse";

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

// CLIENT: SSE Stream
router.get(
    "/:id/stream",
    authenticate,
    allowRoles("CLIENT"),
    bookingSSE
);

export default router;
