// Production-grade API response utilities
import { NextResponse } from 'next/server';
import { ApiResponse } from './types';

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }
}

export function successResponse<T>(data: T, meta?: any): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta,
  });
}

export function errorResponse(
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR',
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status: statusCode }
  );
}

export function validationErrorResponse(errors: Record<string, string[]>): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors,
      },
    },
    { status: 400 }
  );
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse> {
  return errorResponse(message, 403, 'FORBIDDEN');
}

export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiResponse> {
  return errorResponse(message, 404, 'NOT_FOUND');
}

export function conflictResponse(message: string = 'Resource already exists'): NextResponse<ApiResponse> {
  return errorResponse(message, 409, 'CONFLICT');
}

export function badRequestResponse(message: string = 'Bad request'): NextResponse<ApiResponse> {
  return errorResponse(message, 400, 'BAD_REQUEST');
}

export function serverErrorResponse(message: string = 'Internal server error'): NextResponse<ApiResponse> {
  return errorResponse(message, 500, 'INTERNAL_ERROR');
}

export function handleApiError(error: any): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode, error.code);
  }

  // Handle Prisma errors
  if (error?.code === 'P2002') {
    return conflictResponse('Resource already exists');
  }

  if (error?.code === 'P2025') {
    return notFoundResponse('Resource not found');
  }

  return serverErrorResponse('An unexpected error occurred');
}
