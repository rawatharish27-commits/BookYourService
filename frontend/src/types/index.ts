// ============================================
// GLOBAL TYPES (PHASE-1 - FIX ROLLUP IMPORT ERROR)
// ============================================
// Purpose: Centralized types definition to stop build errors
// Location: /types/index.ts (Root - Global Source)
// Stack: TypeScript + React
// Type: Production-Grade (Single Source of Truth)
// 
// IMPORTANT:
// 1. This file acts as a "Global Types Folder".
// 2. All Auth, User, API types are defined here.
// 3. This avoids scattered, inconsistent types.
// 4. Case-sensitive names (Linux compatibility).
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
  role: 'admin' | 'customer' | 'provider';
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

export type UserRole = 'ADMIN' | 'CUSTOMER' | 'PROVIDER';

// ✅ FIX: Alias `User` to `UserDTO` for cleaner imports
export type User = UserDTO;

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
