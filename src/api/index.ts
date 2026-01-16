import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore, useCacheStore, useOfflineStore, useAnalyticsStore } from '../store';

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL!,
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

console.log('API BASE URL =', import.meta.env.VITE_API_BASE_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();

    // Add authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = Date.now().toString();

    // Track API call
    useAnalyticsStore.getState().trackEvent('api_request', {
      url: config.url,
      method: config.method,
    });

    return config;
  },
  (error) => {
    useAnalyticsStore.getState().trackEvent('api_request_error', {
      error: error.message,
    });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Track successful API call
    useAnalyticsStore.getState().trackEvent('api_response', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      duration: Date.now() - parseInt(response.config.headers['X-Request-ID']),
    });

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Track API error
    useAnalyticsStore.getState().trackEvent('api_error', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      message: error.message,
    });

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshResponse = await api.post('/auth/refresh');
        const { token } = refreshResponse.data;

        // Update token in store
        useAuthStore.getState().login(
          useAuthStore.getState().user!,
          token
        );

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle offline mode
    if (!navigator.onLine || error.code === 'NETWORK_ERROR') {
      const offlineStore = useOfflineStore.getState();

      // Queue request for later
      offlineStore.addPendingAction({
        type: 'API_REQUEST',
        payload: {
          method: originalRequest.method,
          url: originalRequest.url,
          data: originalRequest.data,
          headers: originalRequest.headers,
        },
      });

      // Return cached data if available
      const cacheKey = `${originalRequest.method}_${originalRequest.url}`;
      const cachedData = useCacheStore.getState().get(cacheKey);

      if (cachedData) {
        return Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK (cached)',
          headers: {},
          config: originalRequest,
        });
      }
    }

    return Promise.reject(error);
  }
);

// Generic API methods with caching and error handling
class ApiService {
  private cache = useCacheStore.getState();
  private offline = useOfflineStore.getState();

  // Generic GET request with caching
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
    cacheOptions?: { ttl?: number; force?: boolean }
  ): Promise<T> {
    const cacheKey = `GET_${url}`;

    // Check cache first (unless force refresh)
    if (!cacheOptions?.force && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await api.get(url, config);
      const data = response.data;

      // Cache the response
      if (cacheOptions?.ttl !== 0) {
        this.cache.set(cacheKey, data, cacheOptions?.ttl);
      }

      return data;
    } catch (error) {
      // If offline and we have cached data, return it
      if (!navigator.onLine && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      throw error;
    }
  }

  // Generic POST request
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.post(url, data, config);
    return response.data;
  }

  // Generic PUT request
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.put(url, data, config);
    return response.data;
  }

  // Generic PATCH request
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.patch(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.delete(url, config);
    return response.data;
  }

  // File upload with progress
  async uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await api.post(url, formData, uploadConfig);
    return response.data;
  }

  // Batch requests
  async batch(requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: any;
    config?: AxiosRequestConfig;
  }>): Promise<any[]> {
    const promises = requests.map(async (request) => {
      try {
        switch (request.method) {
          case 'GET':
            return await this.get(request.url, request.config);
          case 'POST':
            return await this.post(request.url, request.data, request.config);
          case 'PUT':
            return await this.put(request.url, request.data, request.config);
          case 'PATCH':
            return await this.patch(request.url, request.data, request.config);
          case 'DELETE':
            return await this.delete(request.url, request.config);
          default:
            throw new Error(`Unsupported method: ${request.method}`);
        }
      } catch (error) {
        return { error: error.message, request };
      }
    });

    return Promise.all(promises);
  }

  // WebSocket connection for real-time features
  connectWebSocket(url: string): WebSocket {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      useAnalyticsStore.getState().trackEvent('websocket_connected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      useAnalyticsStore.getState().trackEvent('websocket_disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      useAnalyticsStore.getState().trackEvent('websocket_error');
    };

    return ws;
  }

  // Sync offline actions when back online
  async syncOfflineActions(): Promise<void> {
    const { pendingActions } = this.offline;

    if (pendingActions.length === 0) return;

    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'API_REQUEST':
            await api(action.payload);
            break;
          // Add other action types as needed
        }

        // Remove completed action
        useOfflineStore.getState().removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to sync offline action:', error);
        // Keep failed actions for retry
      }
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await api.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Specific API services
export class AuthService {
  async loginWithPassword(email: string, password: string): Promise<any> {
    return apiService.post('/auth/login/password', { email, password });
  }

  async login(phone: string, otp: string, role: string): Promise<any> {
    return apiService.post('/auth/login', { phone, otp, role });
  }

  async register(userData: any): Promise<any> {
    return apiService.post('/auth/register', userData);
  }

  async verifyOtp(phone: string, otp: string, role: string): Promise<any> {
    return apiService.post('/auth/verify-otp', { phone, otp, role });
  }

  async refreshToken(): Promise<any> {
    return apiService.post('/auth/refresh');
  }

  async logout(): Promise<any> {
    return apiService.post('/auth/logout');
  }

  async getProfile(): Promise<any> {
    return apiService.get('/auth/profile');
  }

  async updateProfile(profileData: any): Promise<any> {
    return apiService.put('/auth/profile', profileData);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    return apiService.post('/auth/change-password', { currentPassword, newPassword });
  }

  async forgotPassword(phone: string): Promise<any> {
    return apiService.post('/auth/forgot-password', { phone });
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    return apiService.post('/auth/reset-password', { token, newPassword });
  }
}

export class BookingService {
  async getBookings(filters?: any, pagination?: any): Promise<any> {
    const params = { ...filters, ...pagination };
    return apiService.get('/bookings', { params });
  }

  async getBooking(id: string): Promise<any> {
    return apiService.get(`/bookings/${id}`);
  }

  async createBooking(bookingData: any): Promise<any> {
    return apiService.post('/bookings', bookingData);
  }

  async updateBooking(id: string, updates: any): Promise<any> {
    return apiService.put(`/bookings/${id}`, updates);
  }

  async cancelBooking(id: string, reason: string): Promise<any> {
    return apiService.post(`/bookings/${id}/cancel`, { reason });
  }

  async assignProvider(bookingId: string, providerId: string): Promise<any> {
    return apiService.post(`/bookings/${bookingId}/assign`, { providerId });
  }

  async getBookingHistory(userId: string): Promise<any> {
    return apiService.get(`/bookings/history/${userId}`);
  }

  async rateBooking(bookingId: string, rating: number, review?: string): Promise<any> {
    return apiService.post(`/bookings/${bookingId}/rate`, { rating, review });
  }
}

export class UserService {
  async getUsers(filters?: any): Promise<any> {
    return apiService.get('/users', { params: filters });
  }

  async getUser(id: string): Promise<any> {
    return apiService.get(`/users/${id}`);
  }

  async updateUser(id: string, updates: any): Promise<any> {
    return apiService.put(`/users/${id}`, updates);
  }

  async suspendUser(id: string, reason: string, duration?: number): Promise<any> {
    return apiService.post(`/users/${id}/suspend`, { reason, duration });
  }

  async activateUser(id: string): Promise<any> {
    return apiService.post(`/users/${id}/activate`);
  }

  async getUserStats(id: string): Promise<any> {
    return apiService.get(`/users/${id}/stats`);
  }

  async uploadDocument(userId: string, documentType: string, file: File, onProgress?: (progress: number) => void): Promise<any> {
    return apiService.uploadFile(`/users/${userId}/documents/${documentType}`, file, onProgress);
  }
}

export class PaymentService {
  async createPaymentIntent(amount: number, currency: string, bookingId?: string): Promise<any> {
    return apiService.post('/payments/create-intent', { amount, currency, bookingId });
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<any> {
    return apiService.post('/payments/confirm', { paymentIntentId, paymentMethodId });
  }

  async getPaymentHistory(userId: string): Promise<any> {
    return apiService.get(`/payments/history/${userId}`);
  }

  async refundPayment(paymentId: string, amount: number, reason: string): Promise<any> {
    return apiService.post(`/payments/${paymentId}/refund`, { amount, reason });
  }

  async addPaymentMethod(userId: string, paymentMethodData: any): Promise<any> {
    return apiService.post(`/users/${userId}/payment-methods`, paymentMethodData);
  }

  async getPaymentMethods(userId: string): Promise<any> {
    return apiService.get(`/users/${userId}/payment-methods`);
  }
}

export class NotificationService {
  async getNotifications(userId: string, filters?: any): Promise<any> {
    return apiService.get(`/notifications/${userId}`, { params: filters });
  }

  async markAsRead(notificationId: string): Promise<any> {
    return apiService.put(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(userId: string): Promise<any> {
    return apiService.put(`/notifications/${userId}/read-all`);
  }

  async deleteNotification(notificationId: string): Promise<any> {
    return apiService.delete(`/notifications/${notificationId}`);
  }

  async sendNotification(userId: string, notification: any): Promise<any> {
    return apiService.post(`/notifications/${userId}`, notification);
  }
}

export class SearchService {
  async search(query: string, filters?: any, type?: string): Promise<any> {
    return apiService.get('/search', {
      params: { q: query, ...filters, type }
    });
  }

  async getSuggestions(query: string): Promise<any> {
    return apiService.get('/search/suggestions', { params: { q: query } });
  }

  async getPopularSearches(): Promise<any> {
    return apiService.get('/search/popular');
  }

  async getSearchHistory(userId: string): Promise<any> {
    return apiService.get(`/search/history/${userId}`);
  }
}

export class AnalyticsService {
  async trackEvent(event: string, properties?: any): Promise<any> {
    return apiService.post('/analytics/track', { event, properties });
  }

  async getUserAnalytics(userId: string, dateRange?: any): Promise<any> {
    return apiService.get(`/analytics/user/${userId}`, { params: dateRange });
  }

  async getPlatformAnalytics(dateRange?: any): Promise<any> {
    return apiService.get('/analytics/platform', { params: dateRange });
  }

  async getRevenueAnalytics(dateRange?: any): Promise<any> {
    return apiService.get('/analytics/revenue', { params: dateRange });
  }
}

export class FileService {
  async uploadFile(file: File, folder?: string, onProgress?: (progress: number) => void): Promise<any> {
    return apiService.uploadFile('/files/upload', file, onProgress, {
      params: { folder }
    });
  }

  async deleteFile(fileId: string): Promise<any> {
    return apiService.delete(`/files/${fileId}`);
  }

  async getFileUrl(fileId: string, expiresIn?: number): Promise<any> {
    return apiService.get(`/files/${fileId}/url`, { params: { expiresIn } });
  }

  async getFiles(userId?: string, folder?: string): Promise<any> {
    return apiService.get('/files', { params: { userId, folder } });
  }
}

// Export all services
export const services = {
  auth: new AuthService(),
  booking: new BookingService(),
  user: new UserService(),
  payment: new PaymentService(),
  notification: new NotificationService(),
  search: new SearchService(),
  analytics: new AnalyticsService(),
  file: new FileService(),
};

// Initialize offline sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    apiService.syncOfflineActions();
  });
}

export default api;
