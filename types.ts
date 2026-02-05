
// --- STRICT DATABASE SCHEMA TYPES ---

export type UUID = string;

export enum BookingStatus {
  INITIATED = 'INITIATED',
  SLOT_LOCKED = 'SLOT_LOCKED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  CONFIRMED = 'CONFIRMED',
  PROVIDER_ASSIGNED = 'PROVIDER_ASSIGNED',
  PROVIDER_ACCEPTED = 'PROVIDER_ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PROVIDER_COMPLETED = 'PROVIDER_COMPLETED',
  CUSTOMER_CONFIRMED = 'CUSTOMER_CONFIRMED',
  COMPLETED = 'COMPLETED',
  SETTLED = 'SETTLED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED'
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED'
}

export interface DbUser {
  id: string; 
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role_id: number;
  status: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  admin_level?: string;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'LIVE' | 'REGISTERED' | 'KYC_SUBMITTED' | 'KYC_UNDER_REVIEW' | 'SUSPENDED';
  rating: number;
  review_count: number;
  email_verified: boolean;
  created_at: string;
}

export interface DbBooking {
  id: string;
  client_id: string;
  provider_id: string;
  service_id: string;
  status: BookingStatus;
  scheduled_time: string;
  total_amount: number;
  platform_fee: number;
  provider_amount: number;
  created_at: string;
  cancel_reason?: string;
}

export interface DbPayment {
  id: string;
  booking_id: string;
  amount: number;
  payment_status: 'CREATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  gateway_txn_id: string;
  verified: boolean;
  created_at: string;
}

// --- FRONTEND APPLICATION TYPES ---

export enum Role {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isBlocked?: boolean;
  verificationStatus?: string;
  rating?: number;
  adminLevel?: string;
}

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  categoryId: number;
  categoryName: string;
  subCategoryId?: number;
  subCategoryName?: string;
  title: string;
  description: string;
  price: number;
  image: string;
  isActive: boolean;
  isApproved: boolean;
  zoneId?: number; 
  zoneName?: string;
  createdAt?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName?: string;
  providerPhone?: string;
  status: BookingStatus;
  scheduled_time: string;
  total_amount: number;
  address?: string;
  notes?: string;
  created_at?: string;
}

export interface Zone {
  id: number;
  name: string;
  city: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    slug?: string;
    is_active?: boolean;
}

export interface SubCategory {
    id: number;
    categoryId: number;
    name: string;
    slug?: string;
    starting_price?: number;
}

export interface ServiceTemplate {
    id: string;
    subcategory_id: number;
    name: string;
    description: string;
    base_price: number;
    min_price: number;
    max_price: number;
}

// Added Review interface to fix import error in services/api.ts
export interface Review {
    id: string;
    bookingId: string;
    clientName: string;
    providerName?: string;
    rating: number;
    comment: string;
    replyText?: string;
    createdAt: string;
    visibilityStatus: 'VISIBLE' | 'HIDDEN' | 'FLAGGED';
}

export interface ProviderStats {
  id: string;
  name: string;
  email: string;
  verification_status: string;
  balance: number;
}