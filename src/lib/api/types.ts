// Production-grade API type definitions

// ============================================
// COMMON TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'CLIENT' | 'PROVIDER';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserInfo;
  token: string;
  expiresAt: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  emailVerified: boolean;
  city: string | null;
  trustScore: number;
}

// ============================================
// USER TYPES
// ============================================

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  description?: string;
  experienceYears?: number;
}

export interface ProviderProfileInput {
  businessName?: string;
  description?: string;
  experienceYears?: number;
}

// ============================================
// SERVICE TYPES
// ============================================

export interface CreateServiceInput {
  categoryId: string;
  subCategoryId?: string;
  title: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
  location?: string;
  city?: string;
  images: string[];
  availabilitySlots: AvailabilitySlotInput[];
}

export interface UpdateServiceInput {
  title?: string;
  description?: string;
  basePrice?: number;
  durationMinutes?: number;
  location?: string;
  city?: string;
  images?: string[];
  isAvailable?: boolean;
}

export interface AvailabilitySlotInput {
  dayOfWeek: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  startTime: string;
  endTime: string;
}

export interface ServiceFilters {
  categoryId?: string;
  subCategoryId?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
}

export interface ServiceDetails {
  id: string;
  providerId: string;
  providerName: string | null;
  providerAvatar: string | null;
  providerRating: number | null;
  categoryId: string;
  subCategoryId: string | null;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  currency: string;
  durationMinutes: number;
  isAvailable: boolean;
  location: string | null;
  city: string | null;
  images: string;
  status: string;
  featured: boolean;
  verified: boolean;
  totalBookings: number;
  totalReviews: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subCategory?: {
    id: string;
    name: string;
  } | null;
}

// ============================================
// BOOKING TYPES
// ============================================

export interface CreateBookingInput {
  serviceId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  address?: string;
  city?: string;
  clientNotes?: string;
}

export interface UpdateBookingInput {
  status?: 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  providerNotes?: string;
  adminNotes?: string;
  cancellationReason?: string;
}

export interface BookingFilters {
  status?: string;
  paymentStatus?: string;
  userId?: string;
  providerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BookingDetails {
  id: string;
  bookingNumber: string;
  clientUserId: string;
  providerUserId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  totalAmount: number;
  currency: string;
  platformFee: number;
  status: string;
  paymentStatus: string;
  address: string | null;
  city: string | null;
  clientNotes: string | null;
  providerNotes: string | null;
  adminNotes: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  provider: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
    businessName: string | null;
  };
  service: {
    id: string;
    title: string;
    description: string;
    basePrice: number;
    durationMinutes: number;
  };
}

// ============================================
// REVIEW TYPES
// ============================================

export interface CreateReviewInput {
  bookingId: string;
  serviceId: string;
  providerId: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
}

export interface ReviewFilters {
  serviceId?: string;
  providerId?: string;
  userId?: string;
  rating?: number;
  isApproved?: boolean;
}

export interface ReviewDetails {
  id: string;
  bookingId: string;
  serviceId: string;
  userId: string;
  providerId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isApproved: boolean;
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface NotificationFilters {
  userId?: string;
  type?: string;
  isRead?: boolean;
}

export interface NotificationDetails {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  metadata: string | null;
  createdAt: string;
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive?: boolean;
  order?: number;
}

export interface CreateSubCategoryInput {
  categoryId: string;
  name: string;
  description?: string;
  order?: number;
}
