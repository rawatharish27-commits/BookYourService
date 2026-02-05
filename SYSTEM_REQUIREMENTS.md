
# ✅ SYSTEM_REQUIREMENTS.md — THE MASTER CONTRACT

**Version:** 3.0 (Codebase Aligned)
**Status:** 🔴 FROZEN (Strict Enforcement Required)
**Scope:** Full Stack (Frontend, Backend, Database, DevOps)

> **MANDATE:** This document is the **single source of truth**. Any code (frontend or backend) that violates these rules must be rejected during Code Review.

---

## 1️⃣ INFRASTRUCTURE & ARCHITECTURE

### 1.1 Tech Stack (Locked)
*   **Frontend:** React 18+ (SPA), Vite, TailwindCSS, Lucide Icons.
*   **Backend:** Node.js 20+, Express.js (Strict TypeScript).
*   **Database:** PostgreSQL 15+ with `pgcrypto` and `uuid-ossp` extensions enabled.
*   **Reverse Proxy:** Nginx (Alpine) handling SSL termination, Gzip, and Header Security.
*   **Containerization:** Docker Compose (v3.8+) with isolated networks.

### 1.2 Network Security Rules
1.  **Database Isolation:** The PostgreSQL container (`bys-db`) must **NOT** map port `5432` to the host machine in Production. It must only be accessible via the internal Docker network `bys-network`.
2.  **API Gateway:** All external traffic must pass through Nginx (`port 80/443`). Direct access to Backend (`port 4000`) from the public internet is **FORBIDDEN**.
3.  **CORS:** `Access-Control-Allow-Origin` must be strictly set to the specific frontend domain in Production. Wildcards (`*`) are banned.

---

## 2️⃣ DATABASE INTEGRITY & SCHEMA RULES

### 2.1 Identity & Primary Keys
*   **UUID Only:** All entities (Users, Bookings, Services, etc.) must use `UUID v4` as Primary Keys.
*   **Exceptions:** Static lookup tables (e.g., `zones`, `cancellation_policies`) may use `SERIAL` IDs if referenced rarely by external APIs.

### 2.2 Strict Schema Enforcement
The application **must** adhere to the `database.sql` schema definitions:
*   **Enums:** Use PostgreSQL `TYPE` for `user_status`, `role_type`, `booking_status`, `payment_status`. String matching in code must align exactly with these Enums.
*   **Soft Deletes:** `users`, `services`, and `bookings` tables must have a `deleted_at` column. `DELETE FROM` queries are **prohibited** on these tables; use `UPDATE ... SET deleted_at = NOW()`.
*   **Audit Columns:** Critical tables must track `created_at` and `updated_at`.

### 2.3 Concurrency Control (Slot Locking)
*   **Mechanism:** The `slot_locks` table is the **only** authority on availability.
*   **Logic:** Before creating a booking, the system MUST verify:
    1.  No existing row in `slot_locks` for `(provider_id, slot_time)`.
    2.  No existing `CONFIRMED` or `IN_PROGRESS` booking in `bookings` table.
*   **TTL:** Slot locks must have an `expires_at` timestamp (Default: 15 minutes).

---

## 3️⃣ SECURITY PROTOCOLS

### 3.1 Authentication & Session
*   **Token Strategy:** Dual Token System.
    *   `Access Token` (JWT): 15 min expiry.
    *   `Refresh Token` (Opaque/JWT): 7 day expiry, with rotation.
*   **Storage:** Tokens must be stored in **HttpOnly, Secure, SameSite=Strict Cookies**. LocalStorage is **BANNED** for sensitive tokens.
*   **Rate Limiting:**
    *   `loginLimiter`: Max 5 attempts per 15 mins.
    *   `rateLimitMiddleware`: Global API limit (e.g., 100 req/min).

### 3.2 Role-Based Access Control (RBAC)
*   **Middleware:** All protected routes must use `authenticate` AND `allowRoles(...)`.
*   **Hierarchy:**
    *   `CLIENT`: Own resources only.
    *   `PROVIDER`: Own resources + Availability.
    *   `ADMIN`: Global access (tiered by `admin_level` L1-L4).

### 3.3 Fraud Prevention (`checkBookingFraud`)
*   **Rapid Cancellations:** Block clients with >3 cancellations in 24h.
*   **Slot Hogging:** Reject booking requests if the client already has an active booking for the exact same slot.

---

## 4️⃣ BOOKING STATE MACHINE (NON-NEGOTIABLE)

Transitions are strictly enforced by `bookingService` and `booking.state.ts`.

| From Status | To Status | Trigger / Condition |
| :--- | :--- | :--- |
| `INITIATED` | `SLOT_LOCKED` | System finds provider & inserts into `slot_locks`. |
| `SLOT_LOCKED` | `PAYMENT_PENDING` | Booking record created. Waiting for payment gateway. |
| `PAYMENT_PENDING` | `CONFIRMED` | **WEBHOOK ONLY**. Payment captured successfully. |
| `CONFIRMED` | `PROVIDER_ASSIGNED` | Provider accepts OR System Auto-Assign confirms. |
| `PROVIDER_ASSIGNED`| `IN_PROGRESS` | Provider scans start code / clicks "Start Job". |
| `IN_PROGRESS` | `COMPLETED` | Provider clicks "Complete Job". |
| `COMPLETED` | `SETTLED` | System calculates commission & credits Provider Wallet. |

**Failure States:**
*   `CANCELLED`: Explicit action by Client/Provider/Admin. Reasons mandatory.
*   `REFUNDED`: Admin or System triggers refund via Gateway.
*   `FAILED`: Payment failed or Slot Lock expired.

---

## 5️⃣ FINANCIAL & PAYMENT ARCHITECTURE

### 5.1 The "Zero Trust" Payment Rule
*   **Frontend:** Can initiate `createPaymentOrder`.
*   **Frontend:** Can display "Payment Successful" UI.
*   **Backend:** **NEVER** trusts the Frontend for payment confirmation.
*   **Verification:** Booking status updates to `CONFIRMED` **ONLY** upon receiving a verified `payment.captured` webhook signature from Razorpay/Stripe.

### 5.2 Escrow & Ledger
*   **Table:** `escrow_ledger` matches `payments` and `bookings`.
*   **Flow:**
    1.  Payment In -> Ledger Credit (Type: `DEPOSIT`).
    2.  Job Complete -> Ledger Debit (Type: `RELEASE`).
    3.  Job Cancelled -> Ledger Debit (Type: `REFUND`).
*   **Provider Wallet:** `provider_wallet` balance updates are **atomic** with `wallet_transactions` inserts.

---

## 6️⃣ PROVIDER GOVERNANCE & ONBOARDING

### 6.1 The Onboarding Pipeline
1.  **Register:** User role becomes `PROVIDER`. Status: `REGISTERED`.
2.  **KYC:** Upload docs to `provider_kyc`. Status: `KYC_SUBMITTED`.
3.  **Admin Review:** Admin L2+ manually reviews. Status: `APPROVED` (or `REJECTED`).
4.  **Setup:** Provider adds Services + Availability.
5.  **Go-Live:** Provider requests activation.
6.  **Live:** Status: `LIVE`. Only `LIVE` providers appear in search.

### 6.2 Quality Assurance
*   **Trust Score:** Calculated via `trustService`. Affected by cancellations, ratings, and volume.
*   **Suspension:** `ADMIN` can `SUSPEND` a provider. This immediately hides all their services from the API.

---

## 7️⃣ DEVELOPMENT STANDARDS

### 7.1 Code Rules
*   **No `any`:** Strict TypeScript.
*   **No Raw SQL Injection:** Always use parameterized queries (`$1`, `$2`) via the `db` adapter.
*   **Centralized Config:** Access environment variables ONLY via `src/config/env.ts` (validated by Zod).

### 7.2 Deployment Checklist (DevOps)
*   **Pre-Flight:** Run `npm run preflight` to validate DB connection and secret strength.
*   **Seeding:** Run `npm run seed:prod` to populate static data (Roles, Categories, Zones).
*   **Health Check:** `/health` endpoint must return database connectivity status.

---

## 🔒 FREEZE CLAUSE

By proceeding past **Step 0.1**:
1.  We agree that the **Database Schema** is the ultimate authority.
2.  We agree that **Financial Logic** resides solely in the Backend.
3.  We agree that **Security** overrides Feature Velocity.
