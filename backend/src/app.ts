import express, { Application, Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util';
import { errorHandler } from '../middleware/error.middleware';

// ============================================
// BACKEND APP CONFIGURATION (SENIOR DEV LEVEL)
// ============================================
// Purpose: Configures Express application (Routes, Middleware, Error Handling)
// Stack: Node.js + Express + TypeScript
// Type: Production-Grade
// 
// IMPORTANT:
// 1. This file configures the Express `app` object.
// 2. It does NOT start the server (see `server.ts`).
// 3. It mounts all API routes (`/api/v1/auth`, `/api/v1/bookings`, etc.).
// 4. It mounts global middleware (CORS, Security, Logging).
// 5. It defines global error handler (404, 500).
// ============================================

const app: Application = express();

// ============================================
// GLOBAL MIDDLEWARE (SECURITY & LOGGING)
// ============================================

// JSON Body Parser (Strict mode to prevent prototype pollution)
app.use(express.json());

// URL Encoded Body Parser
app.use(express.urlencoded({ extended: true }));

// Global Request Logger (Before Routes)
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`[REQUEST] ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// ============================================
// MOUNT ROUTES (API ENDPOINTS)
// ============================================

// Import all route groups (to be created in STEP 4)
// import authRoutes from './routes/auth.routes';
// import bookingRoutes from './routes/booking.routes';
// import providerRoutes from './routes/provider.routes';
// import adminRoutes from './routes/admin.routes';

// Mount routes (Base path: /api/v1)
// Note: We will create these route files in the next steps.
// For now, we define a placeholder to show the structure.

// Example (Placeholder):
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/bookings', bookingRoutes);
// app.use('/api/v1/providers', providerRoutes);
// app.use('/api/v1/admin', adminRoutes);

// ============================================
// GLOBAL ERROR HANDLER (MUST BE LAST MIDDLEWARE)
// ============================================

// Note: This handler must be defined AFTER all routes.
// It catches errors passed via `next(error)` and unhandled exceptions.

app.use(errorHandler);

// ============================================
// EXPORT APP (SERVER ENTRY POINT)
// ============================================

// This `app` object is imported and used by `server.ts`
// server.ts calls `app.listen(PORT, ...)`

export default app;
