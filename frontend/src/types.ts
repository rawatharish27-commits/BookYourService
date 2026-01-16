/**
 * Type definitions for the application
 */

export enum UserRole {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED'
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  city?: string;
  status: 'active' | 'pending' | 'blocked';
  created_at?: string;
}

export interface Provider {
  id: string;
  user_id: string;
  service_type: string;
  experience_years: number;
  rating: number;
  total_reviews: number;
  kyc_status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  is_available: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  base_price: number;
  icon: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  status: BookingStatus;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  total_amount: number;
  payment_status: PaymentStatus;
  notes?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

