
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
  REJECTED = 'REJECTED'
}

export enum WebhookStatus {
  RECEIVED = 'RECEIVED',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
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
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  COD = 'COD',
  UPI = 'UPI',
  WALLET = 'WALLET',
  APPLE_PAY = 'APPLE_PAY',
  CARD = 'CARD'
}

export enum SLATier {
  GOLD = 'GOLD', // 30 mins
  SILVER = 'SILVER', // 2 hours
  BRONZE = 'BRONZE' // 24 hours
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum FraudType {
  MULTI_ACCOUNT_SAME_ID = 'MULTI_ACCOUNT_SAME_ID',
  PRICE_TAMPERING = 'PRICE_TAMPERING',
  HIGH_CANCELLATION = 'HIGH_CANCELLATION'
}

// Security Architecture Types
export interface ThreatModelEntry {
  stride: 'S' | 'T' | 'R' | 'I' | 'D' | 'E';
  category: string;
  threat: string;
  mitigation: string;
  status: 'MITIGATED' | 'MONITORED' | 'RISK_ACCEPTED';
}

export interface SecurityControl {
  id: string;
  area: 'AUTH' | 'AUTHZ' | 'BILLING' | 'PII' | 'INFRA';
  label: string;
  description: string;
  status: 'ENABLED' | 'DISABLED' | 'PENDING';
}

export interface SecurityFinding {
  id: string;
  severity: RiskLevel;
  area: string;
  description: string;
  status: 'OPEN' | 'FIXED';
}

export interface RegionConfig {
  id: string;
  name: string;
  currency: string;
  platformFee: number;
  taxRate: number;
  timezone: string;
  status: 'ACTIVE' | 'PILOT' | 'PLANNED';
  infraCostPerBooking: number;
}

export interface InfraCostBreakdown {
  compute: number;
  database: number;
  otp: number;
  maps: number;
  logging: number;
  total: number;
  perBooking: number;
}

export interface RevenueForecast {
  month: string;
  predictedBookings: number;
  predictedRevenue: number;
  confidence: number;
  growthRate: number;
}

export interface ProviderRank {
  score: number;
  tier: 'PREMIER' | 'STANDARD' | 'RESTRICTED';
  reasons: string[];
  lastCalculated: string;
}

export interface VendorWebhook {
  id: string;
  vendor: 'IDFY' | 'CASHFREE' | 'FIREBASE';
  eventType: string;
  externalRefId: string;
  payload: any;
  status: WebhookStatus;
  retryCount: number;
  createdAt: string;
  processedAt?: string;
}

export interface TrustSafetyKPI {
  activeRiskProviders: number;
  suspendedToday: number;
  fraudSignalsDay: number;
  kycSuccessRate: number;
  avgVerificationTime: string;
  vendorFailureRate: number;
  systemTrustScore: number;
  complaintsPer100: number;
}

export interface KycDocument {
  id: string;
  providerId: string;
  type: 'AADHAAR' | 'PAN' | 'SELFIE';
  fileUrl: string;
  extractedName?: string;
  matchScore?: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface BankAccount {
  id: string;
  providerId: string;
  upiId?: string;
  bankName?: string;
  last4?: string;
  verified: boolean;
}

export interface FraudSignal {
  id: string;
  providerId: string;
  type: FraudType;
  severity: number;
  description: string;
  evidence: any;
  createdAt: string;
  mlScore?: number;
}

export interface VerificationLog {
  id: string;
  entityType: 'USER' | 'PROVIDER';
  entityId: string;
  checkType: 'OTP' | 'AADHAAR' | 'PAN' | 'BANK';
  result: 'SUCCESS' | 'FAIL';
  details: string;
  createdAt: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
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
  equipmentBOM?: string[];
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  type: 'PRICE_VIOLATION' | 'SLA_BREACH' | 'BANNED_ACCESS' | 'PAYMENT_FAILURE';
  message: string;
  severity: RiskLevel;
  resolved: boolean;
}

export interface SOPItem {
  id: string;
  title: string;
  category: 'Ops' | 'Safety' | 'Billing' | 'Support';
  content: string;
  steps: string[];
}

export interface ExpansionChecklist {
  phase: string;
  days: string;
  focus: string;
  tasks: string[];
}

export interface KYCData {
  aadhaarNumber?: string;
  aadhaarUrl?: string;
  panNumber?: string;
  panUrl?: string;
  bankAccount?: string;
  ifscCode?: string;
  upiId?: string;
  selfieUrl?: string;
  verificationNotes?: string;
  submittedAt?: string;
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
  status?: 'ACTIVE' | 'BANNED' | 'SUSPENDED' | 'FORCE_PASSWORD_RESET';
  verification_status: VerificationStatus;
  kyc_data?: KYCData;
  deviceId?: string;
  rank?: ProviderRank;
  region_id?: string;
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
  closed_at?: string;
  total_amount: number;
  sla_deadline?: string;
  escalation_level?: number;
  risk_score?: number;
  risk_level?: RiskLevel;
  risk_factors?: string[];
  predicted_delay_prob?: number;
  scheduledTime?: string;
  selectedAddons?: Addon[];
  providerEarnings?: number;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  region_id?: string;
}

export interface AIRiskAssessment {
  score: number;
  level: RiskLevel;
  factors: string[];
  predicted_delay_prob: number;
}

export interface AuditLogEntity {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  timestamp: string;
  ip_address: '127.0.0.1';
  metadata: string;
  severity: 'INFO' | 'WARN' | 'ERROR';
}

export interface Booking extends ServiceRequestEntity {
  userName: string;
  problemTitle: string;
  category: string;
  subCategory: string;
  ontologyId: string;
  slaTier: SLATier;
  severity: number;
  basePrice: number;
  maxPrice?: number;
  selectedAddons: Addon[];
  visitCharge: number;
  platformFee: number;
  providerEarnings: number;
  address: string;
  history: any[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  providerType: string;
}

export interface InfraMetric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface ProblemCategoryCoverage {
  id: string;
  name: string;
  problemCount: number;
  solvedPercentage: number;
  impact: string;
}

export interface WeeklyChecklist {
  week: number;
  focus: string;
  tasks: string[];
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
}

export interface StateConfig {
  id: string;
  name: string;
  slaModifiers: Partial<Record<SLATier, number>>;
  pricingCaps: Record<string, number>;
  language: string;
  complianceLevel: string;
}

export interface PSUTypeConfig {
  id: string;
  name: string;
  focus: string;
  customMetrics: string[];
}
