// 1. Validate environment variables first
import './config/env.js'; 
import 'dotenv/config';

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import logger from './config/logger.js';
import { authRoutes } from './routes/auth.routes.js';
import { bookingRoutes } from './routes/booking.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { paymentRoutes } from './routes/payment.routes.js';
import { problemRoutes } from './routes/problem.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import { healthCheck } from './middleware/healthCheck.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { prisma } from './config/database.js';

const app: Express = express();
const PORT = process.env.PORT || 8080;

// Trust proxy for Cloud Run/proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://www.bookyourservice.co.in',
      'https://bookyourservice-48728079466.europe-west1.run.app',
    ];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Structured Request Logging
app.use(pinoHttp({ 
  logger,
  // Add request ID
  genReqId: function (req, res) {
    const existingId = req.id ?? req.headers["x-request-id"];
    if (existingId) return existingId;
    const id = Date.now().toString();
    res.setHeader('X-Request-Id', id);
    return id;
  },
}));

// Health check endpoint
app.get('/health', healthCheck);
app.get('/ready', healthCheck);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/categories', categoryRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'BookYourService API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  try {
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  } catch (error) {
    logger.fatal(error, 'Error during graceful shutdown.');
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
app.listen(Number(PORT), () => {
  logger.info(`
    🚀 Server listening on port ${PORT}
    Environment: ${process.env.NODE_ENV}
    API Base: http://localhost:${PORT}/api
    Health: http://localhost:${PORT}/health
  `);
});

export default app;