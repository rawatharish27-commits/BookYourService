// ============================================
// GLOBAL ERROR HANDLER (PHASE 3 - SECURITY GATE)
// ============================================
// Purpose: Centralized error handling for API and Runtime errors.
// Stack: React Context + Error Boundaries.
// Type: Production-Grade (Single Source of Truth).
// 
// IMPORTANT:
// 1. Defines standard Error Classes (ValidationError, AuthError, NotFoundError).
// 2. Provides `handleError` function to standardize responses.
// 3. Used in API Services (Axios interceptors) and React Components.
// ============================================

// ============================================
// 1. CUSTOM ERROR CLASSES
// ============================================

export class AppError extends Error {
  constructor(message: string, public statusCode: number = 500, public isOperational: boolean = false) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  statusCode = 400;
  isOperational = true;
}

export class AuthError extends AppError {
  statusCode = 401;
  isOperational = true;
}

export class ForbiddenError extends AppError {
  statusCode = 403;
  isOperational = true;
}

export class NotFoundError extends AppError {
  statusCode = 404;
  isOperational = true;
}

// ============================================
// 2. ERROR HANDLER FUNCTION
// ============================================

export const handleAPIError = (error: unknown) => {
  // Log error (Production: Winston, Dev: Console)
  console.error('[GlobalErrorHandler] API Error:', error);

  // Handle AppError
  if (error instanceof AppError) {
    const response = {
      success: false,
      message: error.message,
      error: {
        name: error.name,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
      },
    };

    // Return to caller or throw
    throw response; // Or return response object
  }

  // Handle unknown errors
  const response = {
    success: false,
    message: 'Internal Server Error',
    error: {
      name: 'InternalServerError',
      statusCode: 500,
      isOperational: false,
    },
  };

  throw response;
};

// ============================================
// 3. REACT ERROR BOUNDARY COMPONENT (OPTIONAL)
// ============================================

// This component catches errors in React components (UI)
// Usage: <ErrorBoundary fallback={<FallbackComponent} />
/*
export const ErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  class ErrorBoundaryState {
    hasError: boolean;
    error: Error | null = { message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log error to an error reporting service here
    console.error('[ErrorBoundary] Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 bg-red-100 text-white rounded">Error: {this.state.error.message}</div>;
    }

    return this.props.children;
  }
};
*/

// ============================================
// 4. AXIOS INTERCEPTOR (OPTIONAL - IMPLEMENTATION GUIDE)
// ============================================

/*
import axios from 'axios';
import { handleAPIError } from './globalErrorHandler';

// Create Axios Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use((config) => {
  // Add Auth Token to Headers
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API Errors (400, 401, 403, 404, 500)
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        throw new AuthError(data.message || 'Unauthorized');
      } else if (status === 403) {
        throw new ForbiddenError(data.message || 'Forbidden');
      } else if (status === 404) {
        throw new NotFoundError(data.message || 'Not Found');
      } else if (status >= 400 && status < 500) {
        throw new ValidationError(data.message || 'Validation Failed');
      } else {
        throw new AppError(data.message || 'Internal Server Error', status);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
*/

// ============================================
// 5. EXPORT DEFAULT
// ============================================

export default {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  handleAPIError,
};
