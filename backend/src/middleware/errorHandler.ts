import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import logger from '../config/logger.js';
import { AuthError } from '../services/auth.service.js'; // Assuming AuthError is exported from here

// A more structured AppError
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code: string;

  constructor(message: string, statusCode: number, code: string = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Centralized Error Response
const sendError = (res: Response, statusCode: number, message: string, code: string, details?: any) => {
  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(details && { details }),
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error with structured metadata
  logger.error(
    {
      err: {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      req: {
        id: (req as any).id,
        method: req.method,
        path: req.path,
        ip: req.ip,
      },
    },
    `Error occurred during request to ${req.path}`
  );

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.code);
  }

  if (err instanceof AuthError) {
    return sendError(res, 401, err.message, err.code || 'UNAUTHORIZED');
  }

  if (err instanceof ZodError) {
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 400, 'Invalid input provided.', 'VALIDATION_ERROR', details);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // See https://www.prisma.io/docs/reference/api-reference/error-reference
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        return sendError(res, 409, `A record with this value already exists.`, 'UNIQUE_CONSTRAINT_FAILED', {
          fields: err.meta?.target,
        });
      case 'P2025': // Record to delete not found
        return sendError(res, 404, 'The requested record to delete does not exist.', 'RECORD_NOT_FOUND');
      default:
        return sendError(res, 500, 'A database error occurred.', 'DATABASE_ERROR');
    }
  }

  // Fallback for other errors
  const message = process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred on the server.';
  sendError(res, 500, message, 'INTERNAL_SERVER_ERROR');
};