
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, HEADERS } from "./config.js";

export let options = {
  stages: [
    { duration: "30s", target: 50 },  // Warm up
    { duration: "1m", target: 200 },  // Load
    { duration: "30s", target: 500 }, // Stress
    { duration: "10s", target: 0 },   // Cool down
  ],
  thresholds: {
      http_req_failed: ["rate<0.05"], // Allow 5% fail under heavy stress
      http_req_duration: ["p(95)<2000"], // 2s tolerance
  }
};

export default function () {
  // Hit public discovery endpoints (Cacheable? Expensive DB queries?)
  // listServices is expensive (Joins)
  
  const res = http.get(`${BASE_URL}/api/services?page=1&limit=20`, { headers: HEADERS });
  
  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
