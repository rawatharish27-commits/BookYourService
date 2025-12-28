
export enum UserRole {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_OTP = 'PENDING_OTP'
}

export enum ProviderStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
  BANNED = 'BANNED'
}

export enum VerificationStatus {
  REGISTERED = 'REGISTERED',
  KYC_PENDING = 'KYC_PENDING',
  BANK_PENDING = 'BANK_PENDING',
  ADMIN_APPROVED = 'ADMIN_APPROVED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED'
}

export enum BookingStatus {
  CREATED = 'CREATED',
  VERIFIED = 'VERIFIED',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAID = 'PAID',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum LedgerType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum SLATier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD'
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface RatingEntry {
  stars: number;
  timestamp: string;
  comment?: string;
  tags?: string[];
}

/** 
 * Prisma Model: User
 */
export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  verificationStatus: VerificationStatus;
  city: string;
  state_code?: string;
  walletBalance: number;
  createdAt: string;
  kycDetails?: {
    aadhaarNumber?: string;
    panNumber?: string;
    bankAccountNumber?: string;
    documentsUploaded: boolean;
  };
  fraudScore: number;
  rank?: number;
}

export type UserEntity = User;

/** 
 * Prisma Model: Booking
 */
export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  providerId?: string;
  serviceId: string;
  problemTitle: string;
  category?: string;
  subCategory?: string;
  status: BookingStatus;
  priority?: string;
  state_code?: string;
  ward_id?: string;
  created_at?: string;
  createdAt: string;
  total_amount?: number;
  total?: number;
  visitCharge?: number;
  basePrice: number;
  maxPrice: number;
  platformFee?: number;
  providerEarnings?: number;
  selectedAddons?: any[];
  addons: Addon[];
  address?: string;
  ontologyId?: string;
  slaTier?: SLATier;
  severity?: number;
  scheduledTime?: string;
  city: string;
  rating?: number;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
}

/** 
 * Prisma Model: WalletLedger (Append-only)
 */
export interface WalletLedger {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  type: LedgerType;
  category: 'PLATFORM_FEE' | 'SERVICE_PAYOUT' | 'REFUND';
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
  timestamp: string;
}

export interface Problem {
  id: string;
  ontologyId: string;
  category: string;
  subCategory: string;
  title: string;
  basePrice: number;
  maxPrice: number;
  addons: Addon[];
  description: string;
  providerRole: string;
  severity: number;
  slaTier: SLATier;
  isEnabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  providerType: string;
}

export interface SOPItem {
  id: string;
  title: string;
  category: string;
  content: string;
  steps: string[];
}

export enum PaymentMethod {
  UPI = 'UPI',
  COD = 'COD',
  CARD = 'CARD'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  REFUNDED = 'REFUNDED'
}

export interface AuditLogEntity {
  severity: 'INFO' | 'WARNING' | 'ERROR';
}

export type FraudSignal = any;
export type FraudType = any;
