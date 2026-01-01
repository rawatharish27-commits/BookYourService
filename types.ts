
export enum UserRole {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN'
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPS_MANAGER = 'OPS_MANAGER',
  SUPPORT_AGENT = 'SUPPORT_AGENT'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_OTP = 'PENDING_OTP',
  PROBATION = 'PROBATION',
  RETRAINING = 'RETRAINING'
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
  REJECTED = 'REJECTED',
  REVERIFICATION_REQUIRED = 'REVERIFICATION_REQUIRED'
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

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  adminRole?: AdminRole;
  status: UserStatus;
  providerStatus?: ProviderStatus;
  verificationStatus: VerificationStatus;
  city: string;
  walletBalance: number;
  createdAt: string;
  kycDetails?: {
    aadhaarNumber?: string;
    panNumber?: string;
    bankAccountNumber?: string;
    upiId?: string;
    documentsUploaded: boolean;
  };
  fraudScore: number;
  abuseScore: number;
  qualityScore: number;
  jobCount: number;
  isProbation: boolean;
  deviceId?: string;
  lastLogin?: string;
  rank?: number;
}

export interface Booking {
  id: string;
  userId: string;
  providerId?: string;
  serviceId: string;
  problemTitle: string;
  status: BookingStatus;
  createdAt: string;
  slaDeadline: string;
  isSLABreached: boolean;
  total?: number;
  basePrice: number;
  maxPrice: number;
  addons: Addon[];
  city: string;
  category?: string;
  slaTier: SLATier;
  assignedAt?: string;
  cancelProbability?: number;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  rating?: number;
  review?: string;
  complaintId?: string;
  completedAt?: string;
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
  isEnabled: boolean;
  providerType?: string;
}

export interface WalletLedger {
  id: string;
  userId: string;
  bookingId?: string;
  amount: number;
  type: LedgerType;
  category: 'PLATFORM_FEE' | 'SERVICE_PAYOUT' | 'REFUND' | 'PENALTY' | 'WITHDRAWAL';
  timestamp: string;
}

export interface SystemConfig {
  aiKillSwitch: boolean;
  autoMatchingEnabled: boolean;
  globalPlatformFee: number;
  schemaVersion: number;
}

export interface PitchSlide {
  id: number;
  title: string;
  content: string;
}

export interface SOPItem {
  id: string;
  title: string;
  category: string;
  content: string;
  steps: string[];
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

export enum ComplaintSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Complaint {
  id: string;
  bookingId: string;
  userId: string;
  category: string;
  description: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  severity: ComplaintSeverity;
  createdAt: string;
}

// Fixed: Added CityConfig export to resolve module member error in AdminOpsService.ts
export interface CityConfig {
  code: string;
  name: string;
  isEnabled: boolean;
  platformFee: number;
  minProviderBalance: number;
}

export enum PaymentMethod {
  UPI = 'UPI',
  COD = 'COD',
  WALLET = 'WALLET'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum FraudType {
  PRICE_TAMPERING = 'PRICE_TAMPERING',
  CANCELLATION_VELOCITY = 'CANCELLATION_VELOCITY',
  IDENTITY_THEFT = 'IDENTITY_THEFT'
}

export interface FraudSignal {
  id: string;
  userId: string;
  type: FraudType;
  score: number;
  description: string;
  timestamp: string;
  isDismissed: boolean;
}

export interface Penalty {
  id: string;
  providerId: string;
  amount: number;
  reason: string;
  bookingId?: string;
  timestamp: string;
}
