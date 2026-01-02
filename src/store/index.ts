import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { User, Booking, Notification, ThemeMode, Language, Currency } from '../types';

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        login: (user, token) => set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        }),

        logout: () => set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        }),

        updateUser: (userData) => set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        })),

        setLoading: (loading) => set({ isLoading: loading }),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

// UI Store
interface UIState {
  theme: ThemeMode;
  language: Language;
  currency: Currency;
  sidebarOpen: boolean;
  notifications: Notification[];
  loadingStates: Record<string, boolean>;
  modals: Record<string, boolean>;
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (key: string, loading: boolean) => void;
  openModal: (modal: string) => void;
  closeModal: (modal: string) => void;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'AUTO',
        language: 'EN',
        currency: 'INR',
        sidebarOpen: false,
        notifications: [],
        loadingStates: {},
        modals: {},
        toasts: [],

        setTheme: (theme) => {
          set({ theme });
          // Apply theme to document
          const root = document.documentElement;
          if (theme === 'DARK') {
            root.setAttribute('data-theme', 'dark');
          } else if (theme === 'LIGHT') {
            root.removeAttribute('data-theme');
          } else {
            // Auto theme based on system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
          }
        },

        setLanguage: (language) => set({ language }),
        setCurrency: (currency) => set({ currency }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        addNotification: (notification) => set((state) => ({
          notifications: [...state.notifications, {
            ...notification,
            id: Date.now().toString(),
            read: false,
            createdAt: new Date().toISOString(),
          }]
        })),

        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

        setLoading: (key, loading) => set((state) => ({
          loadingStates: { ...state.loadingStates, [key]: loading }
        })),

        openModal: (modal) => set((state) => ({
          modals: { ...state.modals, [modal]: true }
        })),

        closeModal: (modal) => set((state) => ({
          modals: { ...state.modals, [modal]: false }
        })),

        addToast: (toast) => {
          const id = Date.now().toString();
          set((state) => ({
            toasts: [...state.toasts, { ...toast, id }]
          }));

          // Auto remove toast after duration
          if (toast.duration !== 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, toast.duration || 5000);
          }
        },

        removeToast: (id) => set((state) => ({
          toasts: state.toasts.filter(t => t.id !== id)
        })),
      }),
      {
        name: 'ui-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          currency: state.currency,
        }),
      }
    ),
    { name: 'ui-store' }
  )
);

// Booking Store
interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  filters: {
    status?: string;
    category?: string;
    dateRange?: { start: string; end: string };
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // Actions
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  removeBooking: (id: string) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  setFilters: (filters: Partial<BookingState['filters']>) => void;
  setPagination: (pagination: Partial<BookingState['pagination']>) => void;
  resetFilters: () => void;
}

export const useBookingStore = create<BookingState>()(
  devtools(
    (set, get) => ({
      bookings: [],
      currentBooking: null,
      filters: {},
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
      },

      setBookings: (bookings) => set({ bookings }),
      addBooking: (booking) => set((state) => ({
        bookings: [booking, ...state.bookings]
      })),

      updateBooking: (id, updates) => set((state) => ({
        bookings: state.bookings.map(b =>
          b.id === id ? { ...b, ...updates } : b
        ),
        currentBooking: state.currentBooking?.id === id
          ? { ...state.currentBooking, ...updates }
          : state.currentBooking
      })),

      removeBooking: (id) => set((state) => ({
        bookings: state.bookings.filter(b => b.id !== id),
        currentBooking: state.currentBooking?.id === id ? null : state.currentBooking
      })),

      setCurrentBooking: (booking) => set({ currentBooking: booking }),
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),

      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),

      resetFilters: () => set({
        filters: {},
        pagination: { page: 1, limit: 20, total: 0 }
      }),
    }),
    { name: 'booking-store' }
  )
);

// Search Store
interface SearchState {
  query: string;
  results: any[];
  filters: Record<string, any>;
  isSearching: boolean;
  recentSearches: string[];
  suggestions: string[];

  // Actions
  setQuery: (query: string) => void;
  setResults: (results: any[]) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSearching: (searching: boolean) => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  setSuggestions: (suggestions: string[]) => void;
  clearResults: () => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        query: '',
        results: [],
        filters: {},
        isSearching: false,
        recentSearches: [],
        suggestions: [],

        setQuery: (query) => set({ query }),
        setResults: (results) => set({ results }),
        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters }
        })),

        setSearching: (searching) => set({ isSearching: searching }),

        addRecentSearch: (search) => set((state) => ({
          recentSearches: [
            search,
            ...state.recentSearches.filter(s => s !== search)
          ].slice(0, 10)
        })),

        clearRecentSearches: () => set({ recentSearches: [] }),
        setSuggestions: (suggestions) => set({ suggestions }),
        clearResults: () => set({ results: [], query: '', filters: {} }),
      }),
      {
        name: 'search-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          recentSearches: state.recentSearches,
        }),
      }
    ),
    { name: 'search-store' }
  )
);

// Cache Store for API responses
interface CacheState {
  data: Record<string, { data: any; timestamp: number; ttl: number }>;
  set: (key: string, data: any, ttl?: number) => void;
  get: (key: string) => any;
  has: (key: string) => boolean;
  delete: (key: string) => void;
  clear: () => void;
  cleanup: () => void;
}

export const useCacheStore = create<CacheState>()(
  devtools(
    (set, get) => ({
      data: {},

      set: (key, data, ttl = 300000) => { // 5 minutes default TTL
        set((state) => ({
          data: {
            ...state.data,
            [key]: {
              data,
              timestamp: Date.now(),
              ttl,
            },
          },
        }));
      },

      get: (key) => {
        const item = get().data[key];
        if (!item) return null;

        if (Date.now() - item.timestamp > item.ttl) {
          get().delete(key);
          return null;
        }

        return item.data;
      },

      has: (key) => {
        const item = get().data[key];
        if (!item) return false;

        if (Date.now() - item.timestamp > item.ttl) {
          get().delete(key);
          return false;
        }

        return true;
      },

      delete: (key) => set((state) => {
        const newData = { ...state.data };
        delete newData[key];
        return { data: newData };
      }),

      clear: () => set({ data: {} }),

      cleanup: () => set((state) => {
        const now = Date.now();
        const newData: typeof state.data = {};

        Object.entries(state.data).forEach(([key, item]) => {
          if (now - item.timestamp <= item.ttl) {
            newData[key] = item;
          }
        });

        return { data: newData };
      }),
    }),
    { name: 'cache-store' }
  )
);

// Offline Store for offline functionality
interface OfflineState {
  isOnline: boolean;
  pendingActions: Array<{
    id: string;
    type: string;
    payload: any;
    timestamp: number;
  }>;
  cachedData: Record<string, any>;

  // Actions
  setOnline: (online: boolean) => void;
  addPendingAction: (action: Omit<OfflineState['pendingActions'][0], 'id' | 'timestamp'>) => void;
  removePendingAction: (id: string) => void;
  clearPendingActions: () => void;
  setCachedData: (key: string, data: any) => void;
  getCachedData: (key: string) => any;
  clearCache: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  devtools(
    persist(
      (set, get) => ({
        isOnline: navigator.onLine,
        pendingActions: [],
        cachedData: {},

        setOnline: (online) => set({ isOnline: online }),

        addPendingAction: (action) => set((state) => ({
          pendingActions: [...state.pendingActions, {
            ...action,
            id: Date.now().toString(),
            timestamp: Date.now(),
          }]
        })),

        removePendingAction: (id) => set((state) => ({
          pendingActions: state.pendingActions.filter(a => a.id !== id)
        })),

        clearPendingActions: () => set({ pendingActions: [] }),

        setCachedData: (key, data) => set((state) => ({
          cachedData: { ...state.cachedData, [key]: data }
        })),

        getCachedData: (key) => get().cachedData[key],

        clearCache: () => set({ cachedData: {} }),
      }),
      {
        name: 'offline-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          cachedData: state.cachedData,
        }),
      }
    ),
    { name: 'offline-store' }
  )
);

// Analytics Store
interface AnalyticsState {
  events: Array<{
    id: string;
    name: string;
    properties: Record<string, any>;
    timestamp: number;
    sessionId: string;
    userId?: string;
  }>;
  sessionId: string;
  userJourney: string[];

  // Actions
  trackEvent: (name: string, properties?: Record<string, any>) => void;
  startSession: () => void;
  endSession: () => void;
  addToJourney: (step: string) => void;
  clearJourney: () => void;
  getEvents: (limit?: number) => any[];
  clearEvents: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    (set, get) => ({
      events: [],
      sessionId: '',
      userJourney: [],

      trackEvent: (name, properties = {}) => set((state) => ({
        events: [...state.events, {
          id: Date.now().toString(),
          name,
          properties,
          timestamp: Date.now(),
          sessionId: state.sessionId,
          userId: useAuthStore.getState().user?.id,
        }]
      })),

      startSession: () => set({
        sessionId: Date.now().toString(),
        userJourney: []
      }),

      endSession: () => set((state) => ({
        events: [...state.events, {
          id: Date.now().toString(),
          name: 'session_end',
          properties: { duration: Date.now() - parseInt(state.sessionId) },
          timestamp: Date.now(),
          sessionId: state.sessionId,
          userId: useAuthStore.getState().user?.id,
        }],
        sessionId: '',
        userJourney: [],
      })),

      addToJourney: (step) => set((state) => ({
        userJourney: [...state.userJourney, step]
      })),

      clearJourney: () => set({ userJourney: [] }),

      getEvents: (limit) => {
        const events = get().events;
        return limit ? events.slice(-limit) : events;
      },

      clearEvents: () => set({ events: [] }),
    }),
    { name: 'analytics-store' }
  )
);

// Toast Store
interface ToastState {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  addToast: (toast: Omit<ToastState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>()(
  devtools(
    (set, get) => ({
      toasts: [],

      addToast: (toast) => {
        const id = Date.now().toString();
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }]
        }));

        // Auto remove after duration
        if (toast.duration !== 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, toast.duration || 6000);
        }
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      })),

      clearToasts: () => set({ toasts: [] }),
    }),
    { name: 'toast-store' }
  )
);

// Combined store exports for convenience
export const stores = {
  auth: useAuthStore,
  ui: useUIStore,
  booking: useBookingStore,
  search: useSearchStore,
  cache: useCacheStore,
  offline: useOfflineStore,
  analytics: useAnalyticsStore,
  toast: useToastStore,
};

// Initialize stores
export const initializeStores = () => {
  // Set up online/offline detection
  const handleOnline = () => useOfflineStore.getState().setOnline(true);
  const handleOffline = () => useOfflineStore.getState().setOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initialize theme
  const { theme } = useUIStore.getState();
  useUIStore.getState().setTheme(theme);

  // Start analytics session
  useAnalyticsStore.getState().startSession();

  // Clean up cache periodically
  setInterval(() => {
    useCacheStore.getState().cleanup();
  }, 60000); // Every minute

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};