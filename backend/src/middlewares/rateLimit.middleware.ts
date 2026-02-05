import rateLimit from "express-rate-limit";

export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: "Too many login attempts. Please try again after 15 minutes" }
});

export const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { message: "Too many admin requests" }
});

/**
 * 🛡️ ABUSE PROTECTION: Booking Limit
 */
export const bookingRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // Max 20 booking attempts per 15 mins
    message: { message: "Too many booking requests. Please slow down." }
});

/**
 * 🛡️ ABUSE PROTECTION: Payment Limit
 */
export const paymentRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many payment attempts. Contact support if you are having issues." }
});