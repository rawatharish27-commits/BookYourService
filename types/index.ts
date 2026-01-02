
export enum UserRole {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  ENTERPRISE = 'ENTERPRISE',
  PARTNER = 'PARTNER'
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPS_MANAGER = 'OPS_MANAGER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  SECURITY_ADMIN = 'SECURITY_ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_OTP = 'PENDING_OTP',
  PROBATION = 'PROBATION',
  RETRAINING = 'RETRAINING',
  DEACTIVATED = 'DEACTIVATED',
  UNDER_REVIEW = 'UNDER_REVIEW'
}

export enum ProviderStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
  BANNED = 'BANNED',
  ON_BREAK = 'ON_BREAK',
  MAINTENANCE = 'MAINTENANCE'
}

export enum VerificationStatus {
  REGISTERED = 'REGISTERED',
  KYC_PENDING = 'KYC_PENDING',
  BANK_PENDING = 'BANK_PENDING',
  ADMIN_APPROVED = 'ADMIN_APPROVED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  REVERIFICATION_REQUIRED = 'REVERIFICATION_REQUIRED',
  UNDER_REVIEW = 'UNDER_REVIEW'
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
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  WALLET = 'WALLET',
  CARD = 'CARD',
  UPI = 'UPI',
  NET_BANKING = 'NET_BANKING',
  CASH = 'CASH',
  CRYPTO = 'CRYPTO'
}

export enum LedgerType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum SLATier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND'
}

export enum NotificationType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  PROVIDER_ASSIGNED = 'PROVIDER_ASSIGNED',
  SERVICE_STARTED = 'SERVICE_STARTED',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  PROMOTIONAL = 'PROMOTIONAL',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  SECURITY_ALERT = 'SECURITY_ALERT'
}

export enum ThemeMode {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  AUTO = 'AUTO'
}

export enum Language {
  EN = 'en',
  HI = 'hi',
  BN = 'bn',
  TE = 'te',
  MR = 'mr',
  TA = 'ta',
  KN = 'kn',
  GU = 'gu',
  OR = 'or',
  PA = 'pa'
}

export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  AED = 'AED'
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: number; // in minutes
  isPopular?: boolean;
  category: string;
  icon?: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxPrice: number;
  addons: Addon[];
  duration: number;
  category: string;
  subcategory: string;
  tags: string[];
  images: string[];
  isActive: boolean;
  popularity: number;
  rating: number;
  reviewCount: number;
  providerCount: number;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: UserRole;
  adminRole?: AdminRole;
  status: UserStatus;
  providerStatus?: ProviderStatus;
  verificationStatus: VerificationStatus;
  city: string;
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  languages: Language[];
  preferredCurrency: Currency;
  timezone: string;
  theme: ThemeMode;
  notifications: NotificationPreferences;
  kycDetails?: KYCDetails;
  bankDetails?: BankDetails;
  emergencyContacts?: EmergencyContact[];
  preferences: UserPreferences;
  stats: UserStats;
  fraudScore: number;
  abuseScore: number;
  qualityScore: number;
  trustScore: number;
  jobCount: number;
  isProbation: boolean;
  probationEndDate?: string;
  deviceId?: string;
  fcmToken?: string;
  rank?: number;
  badges: Badge[];
  achievements: Achievement[];
  referralCode: string;
  referredBy?: string;
  loyaltyPoints: number;
  membershipTier: MembershipTier;
  subscription?: Subscription;
}

export interface KYCDetails {
  aadhaarNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  drivingLicense?: string;
  voterId?: string;
  bankAccountNumber?: string;
  upiId?: string;
  documentsUploaded: boolean;
  documents: KYCDocument[];
  verificationDate?: string;
  expiryDate?: string;
  addressProof?: AddressProof;
}

export interface KYCDocument {
  type: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'BANK_STATEMENT' | 'UTILITY_BILL';
  url: string;
  uploadedAt: string;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface AddressProof {
  type: 'AADHAAR' | 'PASSPORT' | 'UTILITY_BILL' | 'BANK_STATEMENT';
  address: string;
  city: string;
  state: string;
  pincode: string;
  verified: boolean;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
  branchName: string;
  verified: boolean;
  verificationDate?: string;
  upiIds: string[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  bookingUpdates: boolean;
  promotional: boolean;
  security: boolean;
  marketing: boolean;
  system: boolean;
}

export interface UserPreferences {
  language: Language;
  currency: Currency;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: ThemeMode;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PROVIDERS' | 'PRIVATE';
  phoneVisibility: 'PUBLIC' | 'VERIFIED_USERS' | 'PRIVATE';
  locationVisibility: boolean;
  onlineStatus: boolean;
  lastSeen: boolean;
  readReceipts: boolean;
  typingIndicators: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface UserStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  averageRating: number;
  reviewCount: number;
  favoriteCategories: string[];
  bookingFrequency: number;
  responseTime: number;
  cancellationRate: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  category: 'LOYALTY' | 'QUALITY' | 'ACHIEVEMENT' | 'SPECIAL';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  reward?: AchievementReward;
}

export interface AchievementReward {
  type: 'POINTS' | 'BADGE' | 'DISCOUNT' | 'FEATURE';
  value: number;
  description: string;
}

export interface MembershipTier {
  id: string;
  name: string;
  level: number;
  benefits: MembershipBenefit[];
  requirements: MembershipRequirement;
  color: string;
  icon: string;
}

export interface MembershipBenefit {
  type: 'DISCOUNT' | 'PRIORITY' | 'FEATURE' | 'POINTS_MULTIPLIER';
  value: number;
  description: string;
}

export interface MembershipRequirement {
  minBookings: number;
  minSpent: number;
  minRating: number;
  accountAge: number; // in days
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: PaymentMethod;
  benefits: SubscriptionBenefit[];
}

export interface SubscriptionBenefit {
  type: string;
  value: any;
  description: string;
}

export interface Booking {
  id: string;
  userId: string;
  providerId?: string;
  serviceId: string;
  problemTitle: string;
  description?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  slaDeadline: string;
  isSLABreached: boolean;
  total: number;
  basePrice: number;
  maxPrice: number;
  platformFee: number;
  providerEarnings: number;
  addons: Addon[];
  selectedPackage?: ServicePackage;
  images: string[];
  videos: string[];
  audioNotes?: string[];
  location: BookingLocation;
  category: string;
  subcategory: string;
  slaTier: SLATier;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedAt?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  cancelRequestedBy?: string;
  disputeId?: string;
  complaintId?: string;
  rating?: number;
  review?: Review;
  feedback?: BookingFeedback;
  notes: BookingNote[];
  attachments: BookingAttachment[];
  timeline: BookingTimelineEvent[];
  metadata: Record<string, any>;
  cancelProbability?: number;
  estimatedDuration: number;
  actualDuration?: number;
  distance?: number;
  travelTime?: number;
  rescheduleCount: number;
  modificationCount: number;
}

export interface BookingLocation {
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  placeId?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  helpful: number;
  reported: boolean;
  verified: boolean;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  providerId: string;
  comment: string;
  createdAt: string;
}

export interface BookingFeedback {
  overallSatisfaction: number;
  timeliness: number;
  quality: number;
  communication: number;
  value: number;
  wouldRecommend: boolean;
  suggestions?: string;
  tags: string[];
}

export interface BookingNote {
  id: string;
  bookingId: string;
  authorId: string;
  authorName: string;
  content: string;
  type: 'SYSTEM' | 'PROVIDER' | 'USER' | 'ADMIN';
  isPrivate: boolean;
  createdAt: string;
  attachments?: string[];
}

export interface BookingAttachment {
  id: string;
  bookingId: string;
  filename: string;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface BookingTimelineEvent {
  id: string;
  bookingId: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  actorId?: string;
  actorName?: string;
  metadata?: Record<string, any>;
}

export interface Problem {
  id: string;
  ontologyId: string;
  category: string;
  subCategory: string;
  title: string;
  description: string;
  basePrice: number;
  maxPrice: number;
  addons: Addon[];
  symptoms: string[];
  solutions: string[];
  tools: string[];
  parts: string[];
  duration: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  providerRole: string;
  severity: number;
  slaTier: SLATier;
  isEnabled: boolean;
  tags: string[];
  images: string[];
  videos: string[];
  faqs: FAQ[];
  relatedProblems: string[];
  popularity: number;
  successRate: number;
  averageRating: number;
  bookingCount: number;
}

export interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  image?: string;
  isEnabled: boolean;
  providerType: string;
  subcategories: Subcategory[];
  popularProblems: string[];
  stats: CategoryStats;
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  problemCount: number;
}

export interface CategoryStats {
  totalBookings: number;
  activeProviders: number;
  averageRating: number;
  averagePrice: number;
  popularityRank: number;
}

export interface WalletLedger {
  id: string;
  userId: string;
  bookingId?: string;
  amount: number;
  type: LedgerType;
  category: 'PLATFORM_FEE' | 'SERVICE_PAYOUT' | 'REFUND' | 'PENALTY' | 'WITHDRAWAL' | 'BONUS' | 'CASHBACK' | 'REFERRAL' | 'SUBSCRIPTION';
  description: string;
  timestamp: string;
  balance: number;
  reference: string;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  bookingId?: string;
  userId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  status: PaymentStatus;
  gateway: string;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
}

export interface ChatMessage {
  id: string;
  bookingId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'LOCATION';
  attachments?: ChatAttachment[];
  read: boolean;
  readAt?: string;
  createdAt: string;
  edited: boolean;
  editedAt?: string;
  replyTo?: string;
  reactions: MessageReaction[];
}

export interface ChatAttachment {
  id: string;
  type: string;
  url: string;
  filename: string;
  size: number;
  thumbnail?: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  bookingId?: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface SystemConfig {
  aiKillSwitch: boolean;
  autoMatchingEnabled: boolean;
  globalPlatformFee: number;
  schemaVersion: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  maxBookingPerUser: number;
  maxActiveBookings: number;
  minWalletBalance: number;
  maxWalletBalance: number;
  otpExpiryMinutes: number;
  sessionTimeoutHours: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  supportedLanguages: Language[];
  supportedCurrencies: Currency[];
  timezone: string;
  businessHours: BusinessHours;
  holidays: Holiday[];
  features: FeatureFlags;
  integrations: IntegrationConfig;
  security: SecurityConfig;
  notifications: NotificationConfig;
  payments: PaymentConfig;
}

export interface BusinessHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface Holiday {
  date: string;
  name: string;
  type: 'NATIONAL' | 'REGIONAL' | 'COMPANY';
}

export interface FeatureFlags {
  chat: boolean;
  videoCall: boolean;
  voiceNotes: boolean;
  realTimeTracking: boolean;
  aiRecommendations: boolean;
  loyaltyProgram: boolean;
  referralProgram: boolean;
  subscriptionPlans: boolean;
  emergencyServices: boolean;
  bulkBooking: boolean;
  recurringServices: boolean;
  customPackages: boolean;
  marketplace: boolean;
  auctions: boolean;
  insurance: boolean;
  warranty: boolean;
}

export interface IntegrationConfig {
  paymentGateways: string[];
  smsProviders: string[];
  emailProviders: string[];
  mapProviders: string[];
  analyticsProviders: string[];
  crmProviders: string[];
  storageProviders: string[];
  cdnProviders: string[];
}

export interface SecurityConfig {
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  twoFactorRequired: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  ipWhitelist: string[];
  ipBlacklist: string[];
  geoBlocking: boolean;
  allowedCountries: string[];
}

export interface NotificationConfig {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  bookingConfirmation: boolean;
  paymentReminders: boolean;
  promotionalEmails: boolean;
  systemAlerts: boolean;
  securityAlerts: boolean;
}

export interface PaymentConfig {
  minAmount: number;
  maxAmount: number;
  supportedMethods: PaymentMethod[];
  autoCapture: boolean;
  refundWindowDays: number;
  partialPayments: boolean;
  installmentPayments: boolean;
  walletEnabled: boolean;
  cryptoEnabled: boolean;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Complaint {
  id: string;
  bookingId?: string;
  complainantId: string;
  respondentId?: string;
  type: 'SERVICE_QUALITY' | 'PAYMENT' | 'BEHAVIOR' | 'SAFETY' | 'OTHER';
  title: string;
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  assignedTo?: string;
  escalationReason?: string;
  timeline: ComplaintTimelineEvent[];
}

export interface ComplaintTimelineEvent {
  id: string;
  complaintId: string;
  type: string;
  description: string;
  actorId?: string;
  actorName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CityConfig {
  id: string;
  name: string;
  state: string;
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  serviceable: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime: number;
  operatingHours: BusinessHours;
  holidays: Holiday[];
  stats: CityStats;
}

export interface CityStats {
  totalUsers: number;
  activeProviders: number;
  totalBookings: number;
  averageRating: number;
  topCategories: string[];
  revenue: number;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  applicableCategories: string[];
  applicableUsers: string[];
  firstTimeUsersOnly: boolean;
  description: string;
  terms: string;
  isActive: boolean;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  tiers: LoyaltyTier[];
  pointValue: number; // INR per point
  expiryDays: number;
  welcomeBonus: number;
  referralBonus: number;
  reviewBonus: number;
  rules: LoyaltyRule[];
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: LoyaltyBenefit[];
  color: string;
  icon: string;
}

export interface LoyaltyBenefit {
  type: 'DISCOUNT' | 'FREE_SERVICE' | 'PRIORITY_BOOKING' | 'EXCLUSIVE_ACCESS';
  value: number;
  description: string;
}

export interface LoyaltyRule {
  action: string;
  points: number;
  conditions?: Record<string, any>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: Currency;
  interval: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  features: string[];
  benefits: SubscriptionBenefit[];
  trialDays: number;
  isActive: boolean;
  maxUsers: number;
  popular: boolean;
}

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties: Record<string, any>;
  timestamp: string;
  sessionId: string;
  deviceInfo: DeviceInfo;
  location?: GeoLocation;
}

export interface DeviceInfo {
  type: 'MOBILE' | 'DESKTOP' | 'TABLET';
  os: string;
  osVersion: string;
  browser?: string;
  browserVersion?: string;
  screenResolution: string;
  userAgent: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  targetAudience: ATargetAudience;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'STOPPED';
  metrics: ABTestMetric[];
  winner?: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  weight: number;
  config: Record<string, any>;
}

export interface ATargetAudience {
  userRoles?: UserRole[];
  cities?: string[];
  userSegments?: string[];
  conditions?: Record<string, any>;
}

export interface ABTestMetric {
  name: string;
  type: 'CONVERSION' | 'REVENUE' | 'ENGAGEMENT' | 'RETENTION';
  goal: 'MAXIMIZE' | 'MINIMIZE';
  baseline?: number;
}

export interface Recommendation {
  id: string;
  userId: string;
  type: 'SERVICE' | 'PROVIDER' | 'PACKAGE' | 'ADDON';
  itemId: string;
  score: number;
  reason: string;
  context: RecommendationContext;
  createdAt: string;
  expiresAt: string;
}

export interface RecommendationContext {
  currentBooking?: string;
  location?: BookingLocation;
  timeOfDay?: string;
  dayOfWeek?: string;
  season?: string;
  userHistory: string[];
  similarUsers: string[];
}

export interface SearchQuery {
  id: string;
  userId?: string;
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  timestamp: string;
  sessionId: string;
  duration: number;
  successful: boolean;
}

export interface SearchFilters {
  category?: string;
  subcategory?: string;
  priceRange?: { min: number; max: number };
  rating?: number;
  location?: string;
  availability?: string;
  providerType?: string;
  tags?: string[];
}

export interface SearchResult {
  type: 'SERVICE' | 'PROVIDER' | 'PACKAGE';
  id: string;
  relevance: number;
  metadata: Record<string, any>;
}

export interface VoiceCommand {
  id: string;
  userId: string;
  command: string;
  intent: string;
  confidence: number;
  parameters: Record<string, any>;
  response: string;
  timestamp: string;
  successful: boolean;
}

export interface VideoCall {
  id: string;
  bookingId?: string;
  initiatorId: string;
  participants: string[];
  status: 'INITIATED' | 'RINGING' | 'CONNECTED' | 'ENDED';
  startTime?: string;
  endTime?: string;
  duration?: number;
  recording?: VideoRecording;
  metadata: Record<string, any>;
}

export interface VideoRecording {
  id: string;
  url: string;
  duration: number;
  size: number;
  createdAt: string;
}

export interface EmergencyRequest {
  id: string;
  userId: string;
  location: BookingLocation;
  emergencyType: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'RECEIVED' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED';
  assignedTo?: string;
  responseTime?: number;
  resolutionTime?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface InsuranceClaim {
  id: string;
  bookingId: string;
  userId: string;
  providerId?: string;
  claimType: string;
  description: string;
  amount: number;
  documents: string[];
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
  submittedAt: string;
  approvedAt?: string;
  paidAt?: string;
  rejectionReason?: string;
}

export interface Warranty {
  id: string;
  bookingId: string;
  serviceId: string;
  userId: string;
  providerId: string;
  warrantyType: string;
  description: string;
  duration: number; // in days
  startDate: string;
  endDate: string;
  terms: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED' | 'VOID';
  claims: WarrantyClaim[];
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  description: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  submittedAt: string;
  resolvedAt?: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  initiatorId: string;
  respondentId: string;
  type: 'PAYMENT' | 'SERVICE_QUALITY' | 'MISCOMMUNICATION' | 'OTHER';
  title: string;
  description: string;
  amount?: number;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ESCALATED';
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  evidence: DisputeEvidence[];
  timeline: DisputeTimelineEvent[];
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'MESSAGE' | 'OTHER';
  url: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DisputeTimelineEvent {
  id: string;
  disputeId: string;
  type: string;
  description: string;
  actorId?: string;
  actorName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PitchSlide {
  id: number;
  title: string;
  content: string;
  image?: string;
  video?: string;
  cta?: CallToAction;
}

export interface CallToAction {
  text: string;
  url: string;
  type: 'PRIMARY' | 'SECONDARY' | 'LINK';
}

export interface SOPItem {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: SOPStep[];
  tools: string[];
  safety: string[];
  timeEstimate: number;
  difficulty: string;
  prerequisites: string[];
}

export interface SOPStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  warnings?: string[];
  tips?: string[];
  images?: string[];
  videos?: string[];
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

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  timestamp: string;
}

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
