
export const BASE_URL = __ENV.BASE_URL || "http://localhost:4000";

export const HEADERS = {
  "Content-Type": "application/json",
};

// Pass/Fail Criteria
export const thresholds = {
  http_req_failed: ["rate<0.01"], // Error rate < 1%
  http_req_duration: ["p(95)<800"], // 95% of requests must finish within 800ms
};

export const SLEEP_DURATION = 1;
