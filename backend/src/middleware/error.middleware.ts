import { Request, Response, NextFunction } from 'express';
import { asyncHandler, BadRequestError, UnauthorizedError, NotFoundError, ConflictError, TooManyRequestsError, InternalServerError, AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger.util';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    const statusCode = err.statusCode;
    const message = err.message;
    const isOperational = err.isOperational;

    logger.warn('[OPERATIONAL ERROR]', {
      message,
      statusCode,
      ip: req.ip,
      path: req.originalUrl,
      isOperational,
    });

    return res.status(statusCode).json({
      success: false,
      message,
      error: {
        name: err.constructor.name,
        statusCode,
        isOperational,
      },
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  const statusCode = 500;
  const message = 'Internal Server Error';

  logger.error('[SERVER ERROR]', {
    message: err.message,
    stack: err.stack,
    name: err.constructor.name,
    ip: req.ip,
    path: req.originalUrl,
  });

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      name: 'InternalServerError',
      statusCode,
      isOperational: false,
    },
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default errorHandler;
