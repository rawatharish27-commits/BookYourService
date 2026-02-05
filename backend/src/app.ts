import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { rateLimitMiddleware } from "./middlewares/rateLimit.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { sanitizeInput } from "./middlewares/security.middleware";
import v1Routes from "./routes";

const app = express();

// 🛡️ LAYER 9: SECURE HEADERS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", env.CORS_ORIGIN, "https://api.razorpay.com"],
    }
  },
  hidePoweredBy: true, // Layer 8
  noSniff: true
}) as any);

app.use(cors({ 
  origin: env.CORS_ORIGIN, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-idempotency-key']
}) as any);

// 🛡️ LAYER 3: INPUT VALIDATION & SANITIZATION
app.use(express.json({ limit: "20kb" }) as any); // Anti-DoS: Strict JSON limit
app.use(cookieParser() as any);
app.use(sanitizeInput as any);

app.use(morgan("combined") as any);
app.use(rateLimitMiddleware as any);

app.use("/api", v1Routes);

app.use((_req, res) => {
  (res as any).status(404).json({ message: "Resource not found" });
});

app.use(errorHandler as any);

export default app;