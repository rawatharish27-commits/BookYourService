
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, HEADERS } from "./config.js";
import { createAndLoginClient } from "./utils.js";

export let options = {
  vus: 5,
  duration: "30s",
};

export default function () {
  createAndLoginClient();

  // 1. Create Booking
  // Reuse logic: fetch IDs
  let subCategoryId;
  const catRes = http.get(`${BASE_URL}/api/categories`);
  if (catRes.status === 200 && catRes.json().length > 0) {
      const catId = catRes.json()[0].id;
      const subRes = http.get(`${BASE_URL}/api/categories/${catId}/subcategories`);
      if (subRes.json().length > 0) subCategoryId = subRes.json()[0].id;
  }

  if (subCategoryId) {
      const time = new Date();
      time.setDate(time.getDate() + 10); // Future
      
      const bookingRes = http.post(
        `${BASE_URL}/bookings`,
        JSON.stringify({
          subcategory_id: subCategoryId,
          zone_id: 1,
          scheduled_time: time.toISOString(),
          address: "Cancel St",
          notes: "To be cancelled"
        }),
        { headers: HEADERS }
      );

      if (bookingRes.status === 201) {
          const bookingId = bookingRes.json().booking.id;
          
          // 2. Cancel It
          const cancelRes = http.post(
            `${BASE_URL}/cancellations/${bookingId}/client`,
            JSON.stringify({ reason: "Changed my mind" }),
            { headers: HEADERS }
          );

          check(cancelRes, {
            "cancelled ok": (r) => r.status === 200,
            "status is CANCELLED": (r) => r.json().status === "CANCELLED"
          });
      }
  }
  sleep(1);
}
