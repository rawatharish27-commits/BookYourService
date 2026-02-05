import rateLimit from "express-rate-limit";

/**
 * 🌎 GLOBAL LIMIT: Baseline stability
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests. Please try later." }
});

/**
 * 🔐 AUTH LIMIT: Brute-force protection
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { message: "Security alert: Too many failed login attempts. Account locked for 15 mins." }
});

/**
 * 💳 PAYMENT LIMIT: Fraud prevention
 */
export const paymentRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Strictly 5 attempts per hour
    message: { message: "Security: Payment attempt limit exceeded. Contact support." }
});

/**
 * 🕵️ ADMIN LIMIT: Internal tool protection
 */
export const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { message: "Management interface limit reached." }
});