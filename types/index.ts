// ============================================
// GLOBAL TYPES (PHASE-1 - CENTRALIZE)
// ============================================
// Purpose: Centralized types definition for entire project
// Location: /types/index.ts (Root - Global Source)
// Stack: TypeScript + React
// Type: Production-Grade (Single Source of Truth)
// 
// IMPORTANT:
// 1. This file replaces \`frontend/src/types/index.ts\`.
// 2. All services (Auth, User, Booking, etc.) import from here.
// 3. Eliminates path confusion (\`./types\` vs \`types\`).
// 4. tsconfig.json will map \`types\` to \`./types/index\`.
// ============================================

// ============================================
// 1. AUTH PAYLOADS (LOGIN / REGISTER)
// ============================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'ADMIN' | 'CUSTOMER' | 'PROVIDER';
}

export interface OTPPayload {
  phone: string;
  otp: string;
  purpose: 'LOGIN' | 'START_JOB' | 'END_JOB';
}

// ============================================
// 2. API RESPONSES (STANDARD)
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    name: string;
    message: string;
    statusCode: number;
    isOperational: boolean;
  };
}

// ============================================
// 3. USER TYPES (DTO)
// ============================================

export interface UserDTO {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  createdAt: string;
}

export interface UserRole {
  ADMIN: 'ADMIN';
  CUSTOMER: 'CUSTOMER';
  PROVIDER: 'PROVIDER';
}

// ============================================
// 4. BOOKING TYPES
// ============================================

export interface BookingDTO {
  id: string;
  serviceId: string;
  status: string;
  scheduledDate: string;
  price: number;
}

export interface CreateBookingPayload {
  serviceId: string;
  scheduledDate: string;
  latitude: number;
  longitude: number;
}

// ============================================
// 5. PROVIDER TYPES
// ============================================

export interface ProviderDTO {
  id: string;
  businessName: string;
  city: string;
  rating: number;
  skills: string[];
  status: string;
}

// ============================================
// 6. SERVICE TYPES
// ============================================

export interface ServiceDTO {
  id: string;
  providerId: string;
  title: string;
  category: string;
  pricePerUnit: number;
  durationMinutes: number;
  currency: string;
  images: string[];
  active: boolean;
}

// ============================================
// 7. PAYMENT TYPES
// ============================================

export interface WalletDTO {
  userId: string;
  balance: number;
  currency: string;
}

export interface PaymentDTO {
  id: string;
  bookingId: string;
  customerId: string;
  providerId?: string;
  amount: number;
  gateway: 'RAZORPAY' | 'STRIPE' | 'PAYPAL' | 'CASH';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
}
