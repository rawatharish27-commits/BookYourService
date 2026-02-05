
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, HEADERS } from "./config.js";
import { createAndLoginClient } from "./utils.js";

export let options = {
  vus: 5,
  duration: "30s",
};

// Need setup data? We can just fetch dynamically.

export default function () {
  createAndLoginClient();

  // 1. Need a booking first.
  // We use a random time to ensure success (avoid locking)
  const randomHour = Math.floor(Math.random() * 10) + 8; // 8am - 6pm
  const randomDay = Math.floor(Math.random() * 30) + 1;
  const targetTime = new Date();
  targetTime.setDate(targetTime.getDate() + randomDay);
  targetTime.setHours(randomHour, 0, 0, 0);

  // Hardcoding IDs from seed for simplicity, or fetch like in booking.js
  // Assuming ID 1 exists for zone and subcategory from SeedProd
  // Note: SeedProd creates categories but IDs are UUIDs or Serial. 
  // Ideally we query them. For robustness, let's assume we can query.
  
  // Quick fetch of IDs (In high load test, this `group` overhead is acceptable or move to setup)
  let subCategoryId, zoneId;
  const catRes = http.get(`${BASE_URL}/api/categories`);
  if (catRes.status === 200 && catRes.json().length > 0) {
      const catId = catRes.json()[0].id;
      const subRes = http.get(`${BASE_URL}/api/categories/${catId}/subcategories`);
      if (subRes.json().length > 0) subCategoryId = subRes.json()[0].id;
  }
  zoneId = 1;

  if (subCategoryId) {
      const bookingRes = http.post(
        `${BASE_URL}/bookings`,
        JSON.stringify({
          subcategory_id: subCategoryId,
          zone_id: zoneId,
          scheduled_time: targetTime.toISOString(),
          address: "Payment Test Lane",
          notes: "Testing Payment"
        }),
        { headers: HEADERS }
      );

      if (bookingRes.status === 201) {
          const bookingId = bookingRes.json().booking.id;
          
          // 2. Create Payment Intent
          const payRes = http.post(
            `${BASE_URL}/payments/create`,
            JSON.stringify({ booking_id: bookingId }),
            { headers: HEADERS }
          );

          check(payRes, {
            "payment created": (r) => r.status === 200,
            "has orderId": (r) => r.json().orderId !== undefined
          });
      }
  }

  sleep(1);
}
