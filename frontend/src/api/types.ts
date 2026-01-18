// Central type definitions for API requests and responses

// Example User type
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  createdAt: string;
}

// Example Booking type
export interface Booking {
  id: string;
  userId: string;
  providerId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

// Generic API response for paginated results
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
