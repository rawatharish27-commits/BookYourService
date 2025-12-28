
export enum UserRole {
  USER = 'USER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  GOVT = 'GOVT',
  B2B = 'B2B'
}

export enum BookingStatus {
  REQUESTED = 'REQUESTED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FLAGGED = 'FLAGGED',
  ESCALATED = 'ESCALATED'
}

export enum SLATier {
  GOLD = 'GOLD', // 30 mins (Emergency/Critical)
  SILVER = 'SILVER', // 2 hours (Standard)
  BRONZE = 'BRONZE' // 24 hours (Routine)
}

export interface StateConfig {
  id: string;
  name: string;
  slaModifiers: Record<SLATier, number>; // Duration in minutes
  pricingCaps: Record<string, number>; // Category to max price
  language: string;
  complianceLevel: 'STANDARD' | 'STRICT' | 'SOVEREIGN';
}

export interface PSUTypeConfig {
  id: string;
  name: string;
  focus: 'UTILITY' | 'INFRA' | 'SOCIAL' | 'MUNICIPAL';
  customMetrics: string[];
}

export interface AuditLogEntry {
  status: BookingStatus;
  timestamp: string;
  note: string;
  actor: string;
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

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  providerId?: string;
  providerName?: string;
  problemId: string;
  problemTitle: string;
  ontologyId: string;
  category: string;
  subCategory: string;
  status: BookingStatus;
  createdAt: string;
  scheduledTime?: string;
  slaDeadline?: string;
  slaTier: SLATier;
  severity: number;
  basePrice: number;
  selectedAddons: Addon[];
  visitCharge: number;
  totalAmount: number;
  platformFee: number;
  providerEarnings: number;
  address: string;
  wardId: string;
  isFraudRisk?: boolean;
  history: AuditLogEntry[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  wallet: number;
  trustScore: number;
  isKycVerified: boolean;
  skills?: string[];
  rating?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  providerType: string;
}
