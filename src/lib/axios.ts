import axios from "axios";

/**
 * API CONTRACT RULE:
 * All backend communication MUST flow through this instance.
 */

// Defensive environment variable retrieval
const getEnvVar = (key: string): string => {
  try {
    // Check for Vite/Build-time env
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || "";
    }
    // Check for Node/Fallback env
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || "";
    }
  } catch (e) {
    return "";
  }
  return "";
};

const BASE_URL = getEnvVar('VITE_API_URL') || "http://localhost:4000";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Required for HttpOnly Cookie Auth
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
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

// Response Interceptor: Enforce Auth State & Graceful Error Handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Silent Refresh Cycle (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        processQueue(err);
        // Wipe local identity on refresh failure
        localStorage.removeItem("bys_user");
        if (!window.location.hash.includes("#/login")) {
          window.location.href = "/#/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Global Contract Error Mapping
    const message = error.response?.data?.message || error.response?.data?.error || "Network error. Please try again.";
    
    // Broadcast for UI Toasts
    if (error.response?.status !== 401 && error.response?.status !== 404) {
      window.dispatchEvent(
        new CustomEvent("toast-error", { detail: { message } })
      );
    }

    return Promise.reject(error);
  }
);