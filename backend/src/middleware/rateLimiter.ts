import rateLimit from 'express-rate-limit';
import 'dotenv/config';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10); // 100 requests per 15 minutes

export const apiLimiter = rateLimit({
  windowMs,
  max,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
