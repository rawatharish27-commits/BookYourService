
export enum UserRole {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  GOVT = 'GOVT',
  B2B = 'B2B'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  OTP_VERIFIED = 'OTP_VERIFIED',
  PENDING_ID = 'PENDING_ID',
  ID_VERIFIED = 'ID_VERIFIED',
  BANK_VERIFIED = 'BANK_VERIFIED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  PROBATION = 'PROBATION'
}

export enum BookingStatus {
  CREATED = 'CREATED',
  VERIFIED = 'VERIFIED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  FLAGGED = 'FLAGGED',
  ESCALATED = 'ESCALATED',
  DISPUTED = 'DISPUTED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  REFUNDED = 'REFUNDED'
}

// Fix missing SLATier export
export enum SLATier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD'
}

// Fix missing PaymentMethod export
export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  COD = 'COD'
}

// Fix missing RiskLevel export
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Fix missing FraudType export
export enum FraudType {
  MULTI_ACCOUNT_SAME_ID = 'MULTI_ACCOUNT_SAME_ID',
  DEVICE_COLLISION = 'DEVICE_COLLISION',
  HIGH_CANCELLATION = 'HIGH_CANCELLATION',
  PRICE_TAMPERING = 'PRICE_TAMPERING'
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

// Fix missing RatingEntry export
export interface RatingEntry {
  stars: number;
  timestamp: string;
  comment?: string;
  tags?: string[];
}

// Fix missing Category export
export interface Category {
  id: string;
  name: string;
  icon: string;
  providerType: string;
}

// Fix missing SOPItem export
export interface SOPItem {
  id: string;
  title: string;
  category: string;
  content: string;
  steps: string[];
}

// Fix missing AIRiskAssessment export
export interface AIRiskAssessment {
  score: number;
  level: RiskLevel;
  factors: string[];
  predicted_delay_prob: number;
}

// Fix missing ProviderRank export
export interface ProviderRank {
  score: number;
  tier: 'PREMIER' | 'STANDARD' | 'RESTRICTED';
  reasons: string[];
  lastCalculated: string;
}

// Fix missing FraudSignal export
export interface FraudSignal {
  id: string;
  providerId: string;
  type: FraudType;
  severity: number;
  description: string;
  evidence: any;
  createdAt: string;
}

/** 
 * Image 2: Marketplace Charging & Settlement Node
 */
export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  category: 'PLATFORM_FEE' | 'SERVICE_PAYOUT' | 'TAX' | 'REFUND';
  referenceId: string;
  metadata?: any;
}

export interface Booking extends ServiceRequestEntity {
  userName: string;
  problemTitle: string;
  category: string;
  subCategory: string;
  basePrice: number;
  selectedAddons: Addon[];
  visitCharge: number;
  platformFee: number;
  providerEarnings: number;
  // Inherited from ServiceRequestEntity but used in filters
  ontologyId: string;
  slaTier: SLATier;
  severity: number;
  scheduledTime?: string;
}

export interface ServiceRequestEntity {
  id: string;
  user_id: string;
  service_id: string;
  provider_id?: string;
  status: BookingStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  state_code: string;
  ward_id: string;
  created_at: string;
  total_amount: number;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  engineerName?: string;
  etaMins?: number;
  rating?: number;
  complaint?: string;
  completion_timestamp?: string;
  isSlaBreached?: boolean;
  commission_deducted?: boolean;
  selectedAddons?: Addon[];
  // Fix missing address and sla_deadline
  address: string;
  sla_deadline?: string;
}

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  role_id: UserRole;
  state_code: string;
  is_active: boolean;
  wallet_balance: number;
  trust_score: number;
  created_at: string;
  verification_status: VerificationStatus;
  kyc_data?: any;
  deviceId?: string;
  last_ip?: string;
  completed_jobs_count?: number;
  // Fix missing legal_consent_accepted and rating_history
  legal_consent_accepted?: boolean;
  rating_history?: RatingEntry[];
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

export interface AuditLogEntity {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  timestamp: string;
  ip_address: string;
  metadata?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}
