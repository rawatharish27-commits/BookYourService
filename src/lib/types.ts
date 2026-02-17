// Core User Types
export interface User {
  id: string
  phone: string
  name: string | null
  ageVerified: boolean
  paymentActive: boolean
  activeTill: string | null
  trustScore: number
  latitude: number | null
  longitude: number | null
  locationText: string | null
  isAdmin: boolean
  isFrozen: boolean
  referralCode: string | null
  referredBy: string | null
  referralCount: number
  totalHelpsGiven: number
  totalHelpsTaken: number
  notifyNewRequests: boolean
  notifyPayments: boolean
  notifyReports: boolean
  createdAt: string
  lastActiveAt: string | null
}

// Problem/Request Types
export interface Problem {
  id: string
  userId: string
  type: ProblemType
  riskLevel: RiskLevel
  category?: string
  title: string
  description: string
  offerPrice: number | null
  latitude: number | null
  longitude: number | null
  locationText: string | null
  minTrustRequired: number
  status: ProblemStatus
  viewCount: number
  callCount: number
  createdAt: string
  expiresAt: string | null
  distance?: number
  user: {
    id: string
    phone: string
    name: string | null
    trustScore: number
  }
}

// Payment Types
export interface Payment {
  id: string
  userId: string
  amount: number
  status: PaymentStatus
  month: number
  year: number
  utiRef?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    phone: string
    name: string | null
    trustScore: number
    paymentActive: boolean
  }
}

// Report Types
export interface Report {
  id: string
  reporterId: string
  reportedId: string
  problemId?: string
  reason: string
  category: ReportCategory
  status: ReportStatus
  adminNotes?: string
  createdAt: string
  updatedAt: string
  reporter?: User
  reported?: User
}

// Feedback Types
export interface Feedback {
  id: string
  problemId: string
  helperId: string
  clientId: string
  rating: number
  comment?: string
  helperReached?: boolean
  createdAt: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

// Activity Log Types
export interface ActivityLog {
  id: string
  userId?: string
  action: string
  details?: string
  ipAddress?: string
  createdAt: string
  user?: User
}

// NoShow Types
export interface NoShow {
  id: string
  userId: string
  problemId: string
  createdAt: string
  user: User
}

// OTP Types
export interface OTP {
  id: string
  phone: string
  code: string
  expiresAt: string
  used: boolean
  createdAt: string
}

// Admin Stats Types
export interface AdminStats {
  totalUsers: number
  activePaidUsers: number
  todayProblems: number
  pendingPayments: number
  flaggedUsers: number
  openProblems: number
  totalPayments: number
  totalRevenue: number
  pendingReports: number
}

// Component Props Types
export interface LoginScreenProps {
  onOtpSent: (phone: string, otp: string) => void
  onVerifyOtp: (phone: string, code: string, name: string) => void
  loading: boolean
}

export interface HomeScreenProps {
  user: User | null
  isUserActive: boolean
  onTabChange: (tab: string) => void
}

export interface ProblemListProps {
  problems: Problem[]
  myProblems: Problem[]
  user: User | null
  userLocation: { lat: number; lng: number } | null
  onSelectProblem: (problem: Problem) => void
  onReport: () => void
  onFeedback: () => void
}

export interface PaymentSectionProps {
  payments: Payment[]
  isUserActive: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
  onPaymentRequest: () => void
}

export interface AdminDashboardProps {
  adminStats: AdminStats
  pendingPayments: Payment[]
  adminUsers: User[]
  adminReports: Report[]
  adminProblems: Problem[]
  adminTab: 'overview' | 'payments' | 'users' | 'reports' | 'problems'
  setAdminTab: (tab: 'overview' | 'payments' | 'users' | 'reports' | 'problems') => void
  userSearchQuery: string
  setUserSearchQuery: (query: string) => void
  selectedUser: User | null
  setSelectedUser: (user: User | null) => void
  userActionDialog: boolean
  setUserActionDialog: (open: boolean) => void
  reportActionDialog: boolean
  setReportActionDialog: (open: boolean) => void
  selectedReport: Report | null
  setSelectedReport: (report: Report | null) => void
  adminNotes: string
  setAdminNotes: (notes: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  onRefresh: () => void
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ProblemsResponse {
  problems: Problem[]
  total?: number
  page?: number
  limit?: number
}

export interface PaymentsResponse {
  payments: Payment[]
  total?: number
}

export interface UsersResponse {
  users: User[]
  total?: number
}

export interface ReportsResponse {
  reports: Report[]
  total?: number
}

export interface StatsResponse {
  stats: AdminStats
}

// Form Types
export interface LoginFormData {
  phone: string
  otp: string
  name: string
  termsAccepted: boolean
}

export interface ProblemFormData {
  type: ProblemType
  title: string
  description: string
  offerPrice: string
  locationText: string
}

export interface PaymentFormData {
  amount: number
  month: number
  year: number
}

export interface ReportFormData {
  reason: string
  category: ReportCategory
}

export interface FeedbackFormData {
  rating: number
  comment?: string
  helperReached?: boolean
}

// Enums (matching Prisma schema)
export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ProblemType {
  EMERGENCY = 'EMERGENCY',
  TIME_ACCESS = 'TIME_ACCESS',
  RESOURCE_RENT = 'RESOURCE_RENT'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum ProblemStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum ReportCategory {
  NO_SHOW = 'NO_SHOW',
  MISBEHAVIOR = 'MISBEHAVIOR',
  FRAUD = 'FRAUD',
  SAFETY = 'SAFETY',
  SPAM = 'SPAM',
  FAKE_LOCATION = 'FAKE_LOCATION',
  OTHER = 'OTHER'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED'
}

// Utility Types
export type TrustLevel = 'TRUSTED' | 'NEUTRAL' | 'RESTRICTED'

export interface TrustBadge {
  label: string
  color: string
  icon: string
  description: string
}

export interface Location {
  lat: number
  lng: number
}

export interface SubscriptionInfo {
  price: number
  currency: string
  duration: number
  features: string[]
}

export interface ProblemCategory {
  label: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  riskLevel: RiskLevel
  minTrust: number
  examples: {
    gaon: string[]
    city: string[]
    smartCity: string[]
  }
}

// Trust Score System Types
export interface TrustScoreConfig {
  TRUSTED_MIN: number
  NEUTRAL_MIN: number
  RESTRICTED_MAX: number
  POINTS: {
    SUCCESSFUL_HELP: number
    POSITIVE_RATING: number
    NEUTRAL_RATING: number
    NEGATIVE_RATING: number
    NO_SHOW: number
    VALID_REPORT: number
    WEEKLY_ACTIVE: number
    LOCATION_CONSISTENCY: number
    REFERRAL_BONUS: number
  }
  LIMITS: {
    MAX_POSTS_PER_DAY: number
    MAX_REPORTS_PER_DAY: number
    COOLDOWN_HOURS: number
  }
  MAX_SCORE: number
  MIN_SCORE: number
  DEFAULT_SCORE: number
}

// Error Types
export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface ValidationError {
  field: string
  message: string
}

// Loading States
export interface LoadingState {
  isLoading: boolean
  message?: string
}

// Pagination Types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter Types
export interface ProblemFilters {
  type?: ProblemType
  riskLevel?: RiskLevel
  status?: ProblemStatus
  minTrustRequired?: number
  searchQuery?: string
  location?: Location
  radius?: number
}

export interface UserFilters {
  searchQuery?: string
  paymentActive?: boolean
  isAdmin?: boolean
  isFrozen?: boolean
  trustScoreMin?: number
  trustScoreMax?: number
}

export interface PaymentFilters {
  status?: PaymentStatus
  month?: number
  year?: number
  userId?: string
}

export interface ReportFilters {
  status?: ReportStatus
  category?: ReportCategory
  reporterId?: string
  reportedId?: string
}

// WebSocket Types (for future real-time features)
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: string
}

export interface RealTimeUpdate {
  type: 'PROBLEM_UPDATE' | 'PAYMENT_UPDATE' | 'USER_UPDATE' | 'REPORT_UPDATE'
  data: any
  timestamp: string
}

// Settings Types
export interface UserSettings {
  notifications: {
    newRequests: boolean
    payments: boolean
    reports: boolean
  }
  privacy: {
    showLocation: boolean
    showPhone: boolean
    allowReferrals: boolean
  }
  preferences: {
    language: string
    theme: 'light' | 'dark' | 'system'
  }
}

export interface AdminSettings {
  rateLimits: {
    otpRequests: number
    problemPosts: number
    reports: number
  }
  features: {
    referrals: boolean
    notifications: boolean
    analytics: boolean
  }
  security: {
    requirePhoneVerification: boolean
    enableLocationTracking: boolean
    fraudDetection: boolean
  }
}
