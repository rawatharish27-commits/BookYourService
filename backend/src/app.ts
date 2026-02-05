import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { requestIdMiddleware } from "./middlewares/requestId.middleware";
import { rateLimitMiddleware, bookingRateLimiter, paymentRateLimiter } from "./middlewares/rateLimit.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import apiRoutes from "./routes"; 
import sitemapRoutes from "./routes/sitemap.route";
import availabilityRoutes from "./modules/availability/availability.routes"; 

const app = express();

app.use(express.json({ limit: "1mb" }) as any);
app.use(cookieParser() as any);
app.use(requestIdMiddleware as any);

app.use(
  morgan("combined", {
    skip: () => env.NODE_ENV === "test",
  }) as any
);

app.use(helmet() as any);

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }) as any
);

app.use(rateLimitMiddleware as any);

app.use("/sitemap.xml", sitemapRoutes);

app.get("/health", (_req, res) => {
  (res as any).json({ status: "ok" });
});

app.use("/api/availability", availabilityRoutes);

// --- SECURED ROUTES ---
app.use("/api/v1/bookings", bookingRateLimiter);
app.use("/api/v1/payments", paymentRateLimiter);

app.use("/api", apiRoutes);

app.use((_req, res) => {
  (res as any).status(404).json({ message: "Route not found" });
});

app.use(errorHandler as any);

export default app;