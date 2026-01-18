import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';

import logger from './utils/logger'; // Keeping from HEAD
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { corsOptions } from './config/cors';
import swaggerSpec from './config/swagger';
import { PrismaClient } from '@prisma/client'; // Keeping from incoming

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
const prisma = new PrismaClient();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS with dynamic origin
app.use(cors(corsOptions));

// Rate Limiting
app.use(apiLimiter);

// Request logging
app.use(morgan('dev'));

// JSON Body Parser (Strict mode to prevent prototype pollution)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// API DOCUMENTATION (SWAGGER)
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// ROUTES
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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Checks the health of the server and its database connection.
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: Server is healthy and database is connected.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 db:
 *                   type: string
 *                   example: connected
 *                 time:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server is unhealthy or database connection failed.
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      db: 'connected',
      time: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      db: 'disconnected',
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Status
 *     description: Returns the current status and environment of the API.
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: API is running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: BookYourService API
 *                 status:
 *                   type: string
 *                   example: running
 *                 env:
 *                   type: string
 *                   example: development
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'BookYourService API',
    status: 'running',
    env: process.env.NODE_ENV,
  });
});

// ============================================
// GLOBAL ERROR HANDLER (MUST BE LAST MIDDLEWARE)
// ============================================

// Note: This handler must be defined AFTER all routes.
// It catches errors passed via `next(error)` and unhandled exceptions.

app.use(errorHandler);

export default app;
