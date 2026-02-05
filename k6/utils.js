
import http from "k6/http";
import { BASE_URL, HEADERS } from "./config.js";

// Helper to generate random string
export function randomString(length) {
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < length; i++) {
    res += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return res;
}

// Register a new random client and login
// Returns the cookie jar (handled implicitly by k6) or token headers if needed
export function createAndLoginClient() {
  const email = `testuser_${randomString(8)}@example.com`;
  const password = "Password@123";
  const phone = `1${randomString(9)}`; // Dummy US phone

  // 1. Register
  const regRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      name: "Load Test User",
      email,
      phone,
      password,
      role: "CLIENT",
    }),
    { headers: HEADERS }
  );

  if (regRes.status !== 201) {
    console.error(`Registration Failed: ${regRes.body}`);
    return null;
  }

  // 2. Login
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password }),
    { headers: HEADERS }
  );

  if (loginRes.status !== 200) {
    console.error(`Login Failed: ${loginRes.body}`);
    return null;
  }

  return loginRes;
}
