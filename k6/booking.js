
import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, HEADERS } from "./config.js";
import { createAndLoginClient } from "./utils.js";

export let options = {
  scenarios: {
    race_condition: {
      executor: 'per-vu-iterations',
      vus: 10, // 10 users trying to book AT ONCE
      iterations: 1,
      maxDuration: '30s',
    },
  },
};

// Setup: Ensure we have a valid subcategory and zone to book
export function setup() {
  // Login as admin or just use public API to find IDs
  const catRes = http.get(`${BASE_URL}/api/categories`);
  const cats = catRes.json();
  const cleaning = cats.find(c => c.slug === 'cleaning');
  
  if (!cleaning) throw new Error("Cleaning category not found. Run seed.");

  const subRes = http.get(`${BASE_URL}/api/categories/${cleaning.id}/subcategories`);
  const subs = subRes.json();
  const subCategory = subs[0];

  return { 
    subCategoryId: subCategory.id,
    zoneId: 1 // Assuming 1 is seeded
  };
}

export default function (data) {
  // 1. Create unique client per VU to bypass fraud "Slot Hogging" check
  createAndLoginClient();

  // 2. Define the Target Slot (Fixed time for all VUs to force collision)
  // Use a time far in future to avoid "past time" errors
  const targetTime = new Date();
  targetTime.setDate(targetTime.getDate() + 5);
  targetTime.setHours(10, 0, 0, 0); // All VUs hit 10:00 AM
  const scheduledTime = targetTime.toISOString();

  // 3. Attempt Booking
  const bookingRes = http.post(
    `${BASE_URL}/bookings`,
    JSON.stringify({
      subcategory_id: data.subCategoryId,
      zone_id: data.zoneId,
      scheduled_time: scheduledTime,
      address: "123 Race St",
      notes: "Race condition test"
    }),
    { headers: HEADERS }
  );

  // 4. Assertions
  check(bookingRes, {
    "booking handled correctly": (r) => {
        // 201 = Won the race
        // 409 = Slot locked (Correct behavior)
        // 404 = No provider (If seed has 0 providers)
        return r.status === 201 || r.status === 409 || r.status === 404;
    },
    "no system error": (r) => r.status !== 500
  });

  if (bookingRes.status === 201) {
      console.log(`VU ${__VU} WON the slot!`);
  } else if (bookingRes.status === 409) {
      // console.log(`VU ${__VU} lost (Slot Locked)`);
  } else {
      console.log(`VU ${__VU} unexpected status: ${bookingRes.status} body: ${bookingRes.body}`);
  }

  sleep(1);
}
