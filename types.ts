// --- STRICT DATABASE SCHEMA TYPES ---

export type UUID = string;

export enum BookingStatus {
  // State Machine Statuses
  INITIATED = 'INITIATED',
  SLOT_LOCKED = 'SLOT_LOCKED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  CONFIRMED = 'CONFIRMED',
  PROVIDER_ASSIGNED = 'PROVIDER_ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  
  // Legacy / UI Statuses
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED'
}

export interface DbUser {
  id: string; 
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role_id: number;
  status: 'active' | 'blocked' | 'pending';
  admin_level?: string;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'LIVE' | 'REGISTERED' | 'KYC_SUBMITTED' | 'KYC_UNDER_REVIEW' | 'SUSPENDED';
  rating: number;
  review_count: number;
  email_verified: boolean;
  created_at: string;
}

export interface DbService {
  id: string;
  provider_id: string;
  category_id: number;
  title: string;
  description: string;
  price: number;
  location_id: number;
  is_active: boolean;
  is_approved: boolean;
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
}

export interface DbPayment {
  id: string;
  booking_id: string;
  amount: number;
  payment_status: 'CREATED' | 'SUCCESS' | 'FAILED' | 'REFUND_INITIATED' | 'REFUNDED';
  gateway_txn_id: string;
  verified: boolean;
  created_at: string;
}

export interface DbRole {
  id: number;
  name: string;
}

export interface DbCategory {
  id: number;
  name: string;
  is_active: boolean;
}

export interface DbLocation {
  id: number;
  city: string;
  state: string;
  pincode: string;
}

export interface DbReview {
  id: string;
  booking_id: string;
  client_id: string;
  provider_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface DbAdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_id: string;
  created_at: string;
}

export interface DbSchema {
  roles: DbRole[];
  serviceCategories: DbCategory[];
  locations: DbLocation[];
  users: DbUser[];
  services: DbService[];
  bookings: DbBooking[];
  payments: DbPayment[];
  reviews: DbReview[];
  adminLogs: DbAdminLog[];
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
  locationId?: number; // Legacy
  zoneId?: number; 
  zoneName?: string;
  templateId?: string;
  createdAt?: string;
  rejectReason?: string;
  rating?: number;
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
  canReview?: boolean;
  address?: string;
  notes?: string;
  created_at?: string;
  pricing?: {
      base_price: number;
      platform_fee: number;
      tax: number;
      total: number;
  };
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
    service_count?: number;
    is_active?: boolean;
}

export interface ServiceTemplate {
    id: string;
    subcategory_id: number;
    name: string;
    description: string;
    base_price: number;
    min_price: number;
    max_price: number;
    duration_minutes: number;
    is_active: boolean;
}

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
  trust_score?: number;
}
