
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
  cancelProbability?: number;
  slaTier?: SLATier;
}

// Updated Problem interface to include missing required properties as identified in constants/index.ts error
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

// Added CityConfig interface to resolve global consistency
export interface CityConfig {
  code: string;
  name: string;
  isEnabled: boolean;
  platformFee: number;
  minProviderBalance: number;
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
}
