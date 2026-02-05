
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, HEADERS, thresholds } from "./config.js";

export let options = {
  stages: [
    { duration: "30s", target: 20 }, // Ramp up to 20 users
    { duration: "1m", target: 20 },  // Stay at 20
    { duration: "10s", target: 0 },  // Ramp down
  ],
  thresholds,
};

// Pre-seeded user for auth stress (avoids creating 1000s of users)
// Ensure this user exists via seeding or manual creation
const TEST_USER = {
  email: "client@example.com",
  password: "hashed_secret" // Adjust to match seedProd.ts password if different, seedProd doesn't set pwd, assumed known
};

// If using seedProd.ts, password logic needs to be known. 
// For this test, we'll try to register a user in setup to ensure validity.

export function setup() {
  const email = `auth_stress_${Math.random().toString(36).substring(7)}@test.com`;
  const password = "Password@123";
  
  http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    name: "Auth Stress User",
    email,
    phone: `555${Math.floor(Math.random() * 10000000)}`,
    password,
    role: "CLIENT"
  }), { headers: HEADERS });

  return { email, password };
}

export default function (data) {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: data.email,
      password: data.password,
    }),
    { headers: HEADERS }
  );

  check(res, {
    "login success": (r) => r.status === 200,
    "has access token cookie": (r) => r.headers["Set-Cookie"] && r.headers["Set-Cookie"].includes("access_token"),
  });

  sleep(1);
}
