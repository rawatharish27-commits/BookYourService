import axios from "axios";

const BASE_URL = "http://localhost:4000";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // 🛡️ PHASE 4: IDEMPOTENCY INJECTION
  const financialEndpoints = ['/api/v1/payments', '/api/v1/admin/provider/payout', '/api/v1/bookings'];
  const isFinancial = financialEndpoints.some(endpoint => config.url?.startsWith(endpoint));
  const isWrite = ['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '');

  if (isFinancial && isWrite && !config.headers['x-idempotency-key']) {
    config.headers['x-idempotency-key'] = crypto.randomUUID();
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest)).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        processQueue(err);
        localStorage.removeItem("bys_user");
        if (!window.location.hash.includes("#/login")) {
          window.location.href = "/#/login"; 
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
    if (error.response?.status !== 401 && error.response?.status !== 403) {
        window.dispatchEvent(new CustomEvent("toast-error", { detail: { message: errorMessage } }));
    }

    return Promise.reject(error);
  }
);