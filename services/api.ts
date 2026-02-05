import { api } from "../lib/axios";
import { Service, Booking, BookingStatus, Role, Zone, Category, SubCategory, ServiceTemplate, Review } from "../types";

export { api };

export const loginApi = async (creds: any) => (await api.post("/api/v1/auth/login", creds)).data;
export const registerApi = async (data: any) => (await api.post("/api/v1/auth/register", data)).data;

// PROVIDER ONBOARDING
export const applyAsProvider = async (bio: string) => (await api.post("/api/v1/provider/apply", { bio })).data;
export const getOnboardingStatus = async () => (await api.get("/api/v1/provider/onboarding/status")).data;
export const submitKYC = async (docType: string, docUrl: string) => (await api.post("/api/v1/provider/onboarding/kyc", { documentType: docType, documentUrl: docUrl })).data;
export const requestGoLive = async () => (await api.post("/api/v1/provider/onboarding/golive")).data;

// SEARCH & DISCOVERY (PHASE 6)
export const searchServices = async (q: string, zoneId?: number) => (await api.get(`/api/v1/search?q=${encodeURIComponent(q)}${zoneId ? `&zoneId=${zoneId}` : ''}`)).data;

// CATEGORIES (PUBLIC)
export const getCategories = async () => (await api.get<Category[]>("/api/v1/categories")).data;
export const getSubCategories = async (categoryId: number) => (await api.get<SubCategory[]>(`/api/v1/categories/${categoryId}/subcategories`)).data;
export const getSubCategoriesBySlug = async (slug: string) => (await api.get<{category: Category, subcategories: SubCategory[]}>(`/api/v1/categories/${slug}`)).data;
export const getSubCategoryDetailsBySlug = async (catSlug: string, subSlug: string, zoneId: number) => (await api.get(`/api/v1/categories/${catSlug}/${subSlug}/details?zoneId=${zoneId}`)).data;

// ADMIN GOVERNANCE (PHASE 5)
export const getAdminAuditLogs = async () => (await api.get("/api/v1/admin/audit-logs")).data;
export const getSystemConfigs = async () => (await api.get("/api/v1/admin/config")).data;
export const updateSystemConfig = async (key: string, value: string) => (await api.post("/api/v1/admin/config", { key, value })).data;

// PAYMENTS
export const createPaymentOrder = async (bookingId: string) => (await api.post("/api/v1/payments/create", { booking_id: bookingId })).data;
export const getPaymentStatus = async (bookingId: string) => (await api.get(`/api/v1/payments/status/${bookingId}`)).data;

// PROVIDER TOOLS
export const getWallet = async () => (await api.get("/api/v1/provider/wallet")).data;
export const getBookings = async (role: Role) => (await api.get("/api/v1/bookings/my-bookings")).data;

export const createService = async (data: { template_id: string, zone_id: number, price: number }) => (await api.post("/api/v1/services", data)).data;
export const updateServiceStatus = async (id: string, active: boolean) => (await api.put(`/api/v1/services/${id}`, { is_active: active })).data;