import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';

import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { corsOptions } from './config/cors';
import swaggerSpec from './config/swagger';
import { prisma } from './utils/prisma';

const app: Application = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================
app.use(helmet());
app.use(cors(corsOptions));
app.use(apiLimiter);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// API DOCUMENTATION
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// ROUTES
// ============================================

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Checks server and database health.
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: Server is healthy.
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Status
 *     description: Returns API status.
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: API is running.
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ name: 'BookYourService API', status: 'running' });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use(errorHandler);

export default app;
