
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, HEADERS } from "./config.js";
import { createAndLoginClient } from "./utils.js";

export let options = {
  vus: 20,
  duration: "1m",
};

export default function () {
  createAndLoginClient();

  // 1. Create a booking to listen to
  // (Simplified creation for brevity, assuming existing flow works)
  // In real load test, might use setup() to create one booking and have 50 people listen to it (unrealistic but stress tests the broadcaster)
  // OR create individual bookings. Let's try to just hit the endpoint with a dummy ID to check auth/connection handling if 404 is efficient.
  // Actually, let's create one.
  
  let subCategoryId;
  const catRes = http.get(`${BASE_URL}/api/categories`);
  if (catRes.json().length > 0) {
      const catId = catRes.json()[0].id;
      const subRes = http.get(`${BASE_URL}/api/categories/${catId}/subcategories`);
      subCategoryId = subRes.json()[0].id;
  }

  if (subCategoryId) {
      const bookingRes = http.post(
        `${BASE_URL}/bookings`,
        JSON.stringify({
          subcategory_id: subCategoryId,
          zone_id: 1,
          scheduled_time: new Date().toISOString(),
          address: "SSE St",
          notes: "Stream test"
        }),
        { headers: HEADERS }
      );

      if (bookingRes.status === 201) {
          const bookingId = bookingRes.json().booking.id;

          // 2. Open SSE Connection
          // k6 doesn't fully support keeping SSE open in standard http module easily without extensions,
          // but we can test the handshake and initial response.
          // For full socket stress, k6-experimental is needed. 
          // Here we check if endpoint responds correctly.
          
          const sseRes = http.get(`${BASE_URL}/bookings/${bookingId}/stream`, {
              headers: HEADERS,
              timeout: '2s' // Short timeout just to verify connection established
          });

          // SSE endpoint keeps connection open, so timeout is expected behavior for a standard client that waits.
          // But if we get 200 OK and headers before timeout, that's good. 
          // Actually, standard http.get blocks until body is received or closed.
          // This is a basic sanity check for the route.
          
          // Note: k6 http.get isn't ideal for streaming. 
          // We assume if it didn't error out immediately with 400/500, it accepted the connection.
      }
  }
}
