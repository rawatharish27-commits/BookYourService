// ============================================
// API CONFIGURATION
// ============================================
// Purpose: Central API configuration for all frontend services
// Stack: Axios + TypeScript
// Type: Production-Grade

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const API = {
  BASE_URL: API_BASE_URL,

  // Auth Endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Service Endpoints
  SERVICES: {
    LIST: '/services',
    GET_BY_ID: (id: string) => `/services/${id}`,
    SEARCH: '/services/search',
  },

  // Booking Endpoints
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    GET_BY_ID: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    RESCHEDULE: (id: string) => `/bookings/${id}/reschedule`,
  },

  // Provider Endpoints
  PROVIDERS: {
    LIST: '/providers',
    GET_BY_ID: (id: string) => `/providers/${id}`,
    UPDATE_PROFILE: '/providers/me',
    UPDATE_AVAILABILITY: '/providers/availability',
  },

  // Admin Endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    BOOKINGS: '/admin/bookings',
    PROVIDERS: '/admin/providers',
    STATS: '/admin/stats',
  },
};

// Helper to build full URLs
export const buildUrl = (endpoint: string): string => `${API.BASE_URL}${endpoint}`;
