
import { api } from "../lib/axios";
import { Service, Booking, BookingStatus, Role, Zone, Category, SubCategory, ServiceTemplate, Review } from "../types";

export { api };

export const loginApi = async (creds: any) => (await api.post("/api/auth/login", creds)).data;
export const registerApi = async (data: any) => (await api.post("/api/auth/register", data)).data;

// PROVIDER ONBOARDING
export const applyAsProvider = async (bio: string) => (await api.post("/api/provider/apply", { bio })).data;
export const getOnboardingStatus = async () => (await api.get("/api/provider/onboarding/status")).data;
export const submitKYC = async (docType: string, docUrl: string) => (await api.post("/api/provider/onboarding/kyc", { documentType: docType, documentUrl: docUrl })).data;
export const requestGoLive = async () => (await api.post("/api/provider/onboarding/golive")).data;

// CATEGORIES (PUBLIC)
export const getCategories = async () => (await api.get<Category[]>("/api/categories")).data;
export const getSubCategories = async (categoryId: number) => (await api.get<SubCategory[]>(`/api/categories/${categoryId}/subcategories`)).data;
export const getSubCategoriesBySlug = async (slug: string) => (await api.get<{category: Category, subcategories: SubCategory[]}>(`/api/categories/${slug}`)).data;
export const getSubCategoryDetailsBySlug = async (catSlug: string, subSlug: string, zoneId: number) => (await api.get(`/api/categories/${catSlug}/${subSlug}/details?zoneId=${zoneId}`)).data;

// CATALOG (TEMPLATES)
export const getTemplatesBySubCategory = async (subCategoryId: string) => (await api.get<ServiceTemplate[]>(`/api/catalog/subcategory/${subCategoryId}`)).data;

// ADMIN CATEGORY
export const getAllCategoriesAdmin = async () => (await api.get<Category[]>("/api/categories/admin/all")).data;
export const toggleCategoryStatus = async (id: number, isActive: boolean) => (await api.patch(`/api/categories/${id}/status`, { isActive })).data;
export const createCategory = async (data: {name: string, description: string}) => (await api.post("/api/categories", data)).data;
export const createSubCategory = async (data: {category_id: number, name: string}) => (await api.post("/api/categories/subcategories", data)).data;

// ZONES
export const getZones = async () => {
    // In production, this would also be an API call
    return [
        { id: 1, name: 'Downtown', city: 'New York' },
        { id: 2, name: 'Brooklyn', city: 'New York' },
        { id: 3, name: 'Queens', city: 'New York' }
    ] as Zone[];
};

// SERVICES
export const getServices = async (role: Role, zoneId?: number, page = 1) => {
    let url = "/api/services";
    if (role === Role.PROVIDER) {
        // Provider gets all their own services
        const res = await api.get("/api/services/my-services");
        return res.data.map(mapService);
    }
    
    // ADMIN filtering
    if (role === Role.ADMIN) {
        const res = await api.get("/api/services/admin/all");
        return res.data.map(mapService);
    }

    // CLIENT Public List (Paginated)
    if (role === Role.CLIENT) {
        const res = await api.get(`/api/services?page=${page}&limit=20${zoneId ? `&zoneId=${zoneId}` : ''}`);
        return {
            data: res.data.data.map(mapService),
            pagination: res.data.pagination
        };
    }
};

const mapService = (s: any) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    price: Number(s.price),
    isActive: s.is_active,
    isApproved: s.is_approved,
    providerId: s.provider_id,
    categoryName: s.category_name || 'General',
    subCategoryName: s.subcategory_name,
    zoneId: s.zone_id,
    zoneName: s.zone_name,
    providerName: s.provider_name, 
    image: `https://picsum.photos/seed/${s.id}/400/300`,
    rejectReason: s.reject_reason,
    createdAt: s.created_at,
    rating: s.rating
});

export const getAdminServices = async (status: 'pending' | 'approved' | 'rejected' = 'pending') => {
    const res = await api.get(`/api/services/admin/all?status=${status}`);
    return res.data.map(mapService);
}

// Updated Create Service to send template_id instead of title/desc
export const createService = async (data: { template_id: string, zone_id: number, price: number }) => (await api.post("/api/services", data)).data;
export const updateServiceStatus = async (id: string, active: boolean) => (await api.put(`/api/services/${id}`, { is_active: active })).data;

// BOOKINGS
export const getBookings = async (role: Role) => {
    const res = await api.get("/api/bookings/my-bookings");
    return res.data.map((b: any) => ({
        id: b.id,
        serviceTitle: b.service_title || b.title,
        clientName: b.client_name,
        providerName: b.provider_name,
        providerPhone: b.provider_phone, 
        status: b.status,
        scheduled_time: b.scheduled_time,
        total_amount: Number(b.total_amount),
        address: b.address,
        notes: b.notes,
        created_at: b.created_at 
    }));
};

export const getBookingById = async (id: string) => (await api.get(`/api/bookings/${id}`)).data;

export const createBooking = async (data: { subCategoryId: number, zoneId: number, date: string, address: string, notes: string }) => {
    return (await api.post("/api/bookings", {
        subcategory_id: data.subCategoryId,
        zone_id: data.zoneId,
        scheduled_time: data.date, 
        address: data.address,
        notes: data.notes
    })).data;
};

export const updateBookingStatus = async (id: string, status: BookingStatus) => (await api.patch(`/api/bookings/${id}/status`, { newStatus: status })).data;
export const cancelBooking = async (id: string, reason: string) => (await api.patch(`/api/bookings/${id}/cancel`, { reason })).data;
export const getCancellationPreview = async (id: string) => (await api.get(`/api/bookings/${id}/cancel-preview`)).data;

// REVIEWS
export const submitReview = async (data: { bookingId: string, rating: number, comment: string }) => (await api.post("/api/reviews", data)).data;
export const getServiceReviews = async (serviceId: string) => (await api.get<Review[]>(`/api/reviews/service/${serviceId}`)).data;
export const getFlaggedReviews = async () => (await api.get<Review[]>("/api/reviews/admin/flagged")).data;
export const moderateReview = async (reviewId: string, action: 'HIDE' | 'RESTORE') => (await api.post("/api/reviews/admin/moderate", { reviewId, action })).data;

// PAYMENTS
export const createPaymentOrder = async (bookingId: string) => (await api.post("/api/payments/create", { booking_id: bookingId })).data;
export const getPaymentStatus = async (bookingId: string) => (await api.get(`/api/payments/status/${bookingId}`)).data;

// ADMIN TOOLS
export const getSystemMetrics = async () => (await api.get("/api/admin/metrics")).data;
export const approveService = async (id: string) => (await api.post(`/api/services/${id}/approve`)).data;
export const rejectService = async (id: string, reason: string) => (await api.post(`/api/services/${id}/reject`, { reason })).data;
export const getProvidersForPayout = async () => (await api.get("/api/admin/providers-wallet")).data;
export const payoutProvider = async (providerId: string, amount: number) => (await api.post("/api/admin/provider/payout", { providerId, amount })).data;
export const verifyProvider = async (providerId: string, status: 'APPROVED' | 'REJECTED') => (await api.post("/api/admin/provider/verify", { providerId, status })).data;

// NEW: GOVERNANCE
export const getSystemConfigs = async () => (await api.get("/api/admin/config")).data;
export const updateSystemConfig = async (key: string, value: string) => (await api.post("/api/admin/config", { key, value })).data;
export const getDisputes = async () => (await api.get("/api/admin/disputes")).data;
export const resolveDispute = async (data: { disputeId: string, outcome: string, notes: string }) => (await api.post("/api/admin/disputes/resolve", data)).data;

// PROVIDER TOOLS
export const setAvailability = async (data: { dayOfWeek: number, startTime: string, endTime: string, available: boolean }) => (await api.post("/api/provider/availability", data)).data;
export const getAvailability = async () => (await api.get("/api/provider/availability")).data;
export const getWallet = async () => (await api.get("/api/provider/wallet")).data;
