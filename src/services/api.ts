import { api } from "../lib/axios";
import { Service, Booking, BookingStatus, Role, Zone, Category, SubCategory, ServiceTemplate, Review } from "../types";

/**
 * 🛑 PRODUCTION GUARD
 */
const isProd = (() => {
  try {
    return (import.meta as any).env?.PROD === true;
  } catch {
    return false;
  }
})();

if (isProd) {
  if ((globalThis as any).__MOCK__ === true || (globalThis as any).__MOCK_DATA__) {
    throw new Error("❌ Marketplace Security: Mock usage is strictly blocked in production.");
  }
}

export { api };

export const loginApi = async (creds: any) => (await api.post("/api/v1/auth/login", creds)).data;
export const registerApi = async (data: any) => (await api.post("/api/v1/auth/register", data)).data;

// Auth Endpoints
export const logoutApi = async () => (await api.post("/api/v1/auth/logout")).data;
export const getMeApi = async () => (await api.get("/api/v1/users/me")).data;

// PROVIDER ONBOARDING
export const applyAsProvider = async (bio: string) => (await api.post("/api/v1/provider/apply", { bio })).data;
export const getOnboardingStatus = async () => (await api.get("/api/v1/provider/status")).data;
export const submitKYC = async (docType: string, docUrl: string) => (await api.post("/api/v1/provider/kyc", { documentType: docType, documentUrl: docUrl })).data;
export const requestGoLive = async () => (await api.post("/api/v1/provider/request-go-live")).data;

// CATEGORIES & DISCOVERY
export const getCategories = async () => (await api.get<Category[]>("/api/v1/categories")).data;
export const getSubCategories = async (categoryId: number) => (await api.get<SubCategory[]>(`/api/v1/categories/${categoryId}/subcategories`)).data;
export const getSubCategoriesBySlug = async (slug: string) => (await api.get<{category: Category, subcategories: SubCategory[]}>(`/api/v1/categories/${slug}`)).data;
export const getSubCategoryDetailsBySlug = async (catSlug: string, subSlug: string, zoneId: number) => (await api.get(`/api/v1/categories/${catSlug}/${subSlug}/details?zoneId=${zoneId}`)).data;

// ZONES
// Renamed from getZonesFallback to getZones to fix import error in CreateService.tsx
export const getZones = async () => {
    return [
        { id: 1, name: 'Mumbai Central', city: 'Mumbai' },
        { id: 2, name: 'Bandra/Andheri', city: 'Mumbai' },
        { id: 3, name: 'Delhi NCR', city: 'Delhi' }
    ] as Zone[];
};

export const getZonesFallback = getZones;

// PHASE 3: BOOKING & PAYMENT GATE
export const createBooking = async (data: { subCategoryId: number, zoneId: number, date: string, address: string, notes: string }) => {
    // This initiates the SLOT_LOCK logic on backend
    return (await api.post("/api/v1/bookings", {
        subcategory_id: data.subCategoryId,
        zone_id: data.zoneId,
        scheduled_time: data.date, 
        address: data.address,
        notes: data.notes
    })).data;
};

// Renamed from initPayment to createPaymentOrder to fix import error in MyBookings.tsx
export const createPaymentOrder = async (bookingId: string) => (await api.post("/api/v1/payments/create", { booking_id: bookingId })).data;
export const initPayment = createPaymentOrder;
export const getPaymentStatus = async (bookingId: string) => (await api.get(`/api/v1/payments/status/${bookingId}`)).data;

// SHARED READS
export const getBookings = async (role: Role) => {
    const res = await api.get("/api/v1/bookings/my-bookings");
    return res.data;
};

export const getBookingById = async (id: string) => (await api.get(`/api/v1/bookings/${id}`)).data;

// PROVIDER TOOLS
export const startJob = async (id: string) => (await api.post(`/api/v1/bookings/${id}/start`)).data;
export const completeJob = async (id: string) => (await api.post(`/api/v1/bookings/${id}/complete`)).data;
export const getWallet = async () => (await api.get("/api/v1/provider/wallet")).data;
export const getAvailability = async () => (await api.get<any[]>("/api/v1/provider/availability")).data;
export const setAvailability = async (data: { slots: any[] }) => (await api.post("/api/v1/provider/availability", data)).data;

// HELPERS
export const getServices = async (role: Role) => {
    if (role === Role.PROVIDER) {
        const res = await api.get("/api/v1/services/my-services");
        return res.data;
    }
    return [];
};
export const updateServiceStatus = async (id: string, active: boolean) => (await api.put(`/api/v1/services/${id}`, { is_active: active })).data;
export const cancelBooking = async (id: string, reason: string) => (await api.patch(`/api/v1/bookings/${id}/cancel`, { reason })).data;
export const getCancellationPreview = async (id: string) => (await api.get(`/api/v1/bookings/${id}/cancel-preview`)).data;
export const submitReview = async (data: { bookingId: string, rating: number, comment: string }) => (await api.post("/api/v1/reviews", data)).data;
export const getServiceReviews = async (serviceId: string) => (await api.get<Review[]>(`/api/v1/reviews/service/${serviceId}`)).data;
export const getPublicStats = async () => (await api.get("/api/v1/public/stats")).data;
export const getProvidersForPayout = async () => (await api.get("/api/v1/admin/providers-wallet")).data;
export const verifyProvider = async (id: string, status: string) => (await api.post("/api/v1/admin/provider/verify", { providerId: id, status })).data;
export const payoutProvider = async (id: string, amount: number) => (await api.post("/api/v1/admin/provider/payout", { providerId: id, amount })).data;
export const getSystemMetrics = async () => (await api.get("/api/v1/admin/metrics")).data;
export const getSystemConfigs = async () => (await api.get("/api/v1/admin/config")).data;
export const updateSystemConfig = async (key: string, value: string) => (await api.post("/api/v1/admin/config", { key, value })).data;
export const getDisputes = async () => (await api.get("/api/v1/admin/disputes")).data;
export const resolveDispute = async (data: any) => (await api.post("/api/v1/admin/disputes/resolve", data)).data;
export const getTemplatesBySubCategory = async (id: string) => (await api.get(`/api/v1/catalog/subcategory/${id}`)).data;
export const getAdminServices = async (status: string) => (await api.get(`/api/v1/services/admin/all?status=${status}`)).data;
export const approveService = async (id: string) => (await api.post(`/api/v1/services/${id}/approve`)).data;
export const rejectService = async (id: string, reason: string) => (await api.post(`/api/v1/services/${id}/reject`, { reason })).data;
export const getPublicProviderProfile = async (slug: string) => (await api.get(`/api/v1/provider/public/${slug}`)).data;

// Added members to fix import errors in admin and provider components
export const createService = async (data: { template_id: string, zone_id: number, price: number }) => (await api.post("/api/v1/services", data)).data;
export const getAllCategoriesAdmin = async () => (await api.get<Category[]>("/api/v1/categories/admin/all")).data;
export const createCategory = async (data: {name: string, description: string}) => (await api.post("/api/v1/categories", data)).data;
export const createSubCategory = async (data: {category_id: number, name: string}) => (await api.post("/api/v1/categories/subcategories", data)).data;
export const toggleCategoryStatus = async (id: number, isActive: boolean) => (await api.patch(`/api/v1/categories/${id}/status`, { isActive })).data;

export const getFlaggedReviews = async () => (await api.get<Review[]>("/api/v1/reviews/admin/flagged")).data;
export const moderateReview = async (reviewId: string, action: 'HIDE' | 'RESTORE') => (await api.post("/api/v1/reviews/admin/moderate", { reviewId, action })).data;
