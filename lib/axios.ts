
import axios from "axios";

// In a real environment, this would come from import.meta.env
const BASE_URL = "http://localhost:4000";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // MANDATORY for HttpOnly Cookies
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle Errors & Silent Refresh via Cookies
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Handle 401 Unauthorized (Token Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt Refresh (Cookies are sent automatically)
        await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });

        // If successful, backend has set new cookies. We just retry.
        processQueue(null);
        return api(originalRequest);

      } catch (err) {
        processQueue(err);
        
        // Clear Local UI State & Redirect
        localStorage.removeItem("bys_user");
        if (!window.location.hash.includes("#/login") && !window.location.hash.includes("#/")) {
             window.location.href = "/#/login"; 
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Dispatch Toast Event for UI Feedback (Non-401 errors)
    const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
    if (error.response?.status !== 401 && error.response?.status !== 403) {
        window.dispatchEvent(
            new CustomEvent("toast-error", { detail: { message: errorMessage } })
        );
    }

    return Promise.reject(error);
  }
);
