# 🧭 DATABASE MIGRATION, ROLLBACK & DATA BACKFILL PLAN

**Project:** Book Your Service  
**ORM:** Prisma  
**File of Truth:** `backend/prisma/schema.prisma`  
**Target Version:** 3.0 (Production Hardened)

---

## 🔴 IMPORTANT PRODUCTION RULES (MANDATORY)
*   ❌ **Single huge migrations** are prohibited in production.
*   ✅ **Logical phases** only.
*   ✅ **Validation** required after every phase.
*   ✅ **Rollback capability** must be verified before execution.
*   ✅ **Zero Data Loss:** Existing tables must remain untouched or transformed safely.

---

## 🧭 MIGRATION PHASE BREAKDOWN

### PHASE 1 – AUTH & SECURITY TABLES (Low Risk)
**Goal:** Harden session management and auditing without touching existing user data.
- **Tables:** `RefreshToken`, `PasswordResetToken`, `VerificationToken`, `LoginAudit`
- **Command:** `npx prisma migrate dev --name auth_security_tables`
- **Validation:** `SELECT COUNT(*) FROM "refresh_tokens";` (Should be 0 initially).

### PHASE 2 – PROVIDER / VENDOR TABLES (Medium Risk)
**Goal:** Enable KYC and availability grids.
- **Tables:** `ProviderKYC`, `ProviderDocument`, `ProviderAvailability`
- **Command:** `npx prisma migrate dev --name provider_kyc_and_availability`
- **Validation:** `SELECT * FROM "ProviderProfile";` -> Ensure IDs exist before KYC backfill.

### PHASE 3 – BOOKING LIFECYCLE EXTENSIONS (Medium Risk)
**Goal:** Multi-stage cancellation and dispute handling.
- **Tables:** `CancellationReason`, `Refund`, `Dispute`
- **Command:** `npx prisma migrate dev --name booking_extensions`
- **Risk:** High dependency on `bookings` and `payments` tables.

### PHASE 4 – PAYMENT SAFETY (High Risk)
**Goal:** Prevent double-charges and enable payouts.
- **Tables:** `PaymentAttempt`, `IdempotencyKey`, `Payout`
- **Command:** `npx prisma migrate dev --name payment_safety_tables`
- **Rule:** Deploy payment code changes **before** enabling these tables.

### PHASE 5 – ADMIN & COMPLIANCE (Low Risk)
**Goal:** Immutable tracking of admin actions and dynamic settings.
- **Tables:** `AdminAuditLog`, `SystemConfig`
- **Command:** `npx prisma migrate dev --name admin_audit_and_config`

### PHASE 6 – SEARCH & ANALYTICS (Low Risk)
**Goal:** Optimization for discovery and stats.
- **Tables:** `SearchIndex`, `ServiceViewStats`
- **Command:** `npx prisma migrate dev --name search_and_analytics`

---

## 🛡️ ROLLBACK STRATEGY (REAL PRODUCTION SAFE)

### RULE: NEVER USE `migrate reset` IN PROD

#### OPTION 1 – Prisma Safe Rollback (Preferred)
If migration fails mid-way:
1.  `npx prisma migrate resolve --rolled-back "migration_name"`
2.  Fix schema locally.
3.  Create new migration.

#### OPTION 2 – Manual SQL Rollback (Emergency)
Use only if migration partially applied and Prisma state is corrupted:
```sql
-- Example for Phase 1
DROP TABLE IF EXISTS "refresh_tokens";
DROP TABLE IF EXISTS "password_reset_tokens";
```

---

## 🔁 DATA BACKFILL PLAN (MANDATORY)

### 1️⃣ ProviderKYC Backfill
Existing providers must have a pending KYC record to avoid UI breaks.
```sql
INSERT INTO "provider_kyc" ("id", "provider_id", "status", "created_at")
SELECT uuid_generate_v4(), id, 'PENDING', NOW()
FROM "providers"
WHERE id NOT IN (SELECT "provider_id" FROM "provider_kyc");
```

### 2️⃣ ServiceViewStats Backfill
```sql
INSERT INTO "service_view_stats" ("id", "service_id", "views_count")
SELECT uuid_generate_v4(), id, 0
FROM "services"
WHERE id NOT IN (SELECT "service_id" FROM "service_view_stats");
```

### 3️⃣ SystemConfig Defaults
```sql
INSERT INTO "system_configs" ("key", "value", "description")
VALUES
('BOOKING_ENABLED', 'true', 'Global toggle for new bookings'),
('PAYMENT_ENABLED', 'true', 'Global toggle for payment processing'),
('KYC_REQUIRED', 'true', 'Force KYC check for providers');
```

### 4️⃣ Existing Payments Safety
```sql
UPDATE "payments"
SET payment_status = 'SUCCESS'
WHERE payment_status IS NULL;
```

---

## ✅ POST-MIGRATION VERIFICATION CHECKLIST

1.  **Engine Check:**
    *   `npx prisma generate`
    *   `npx prisma validate`
2.  **Data Integrity:**
    *   `SELECT COUNT(*) FROM "users";` (Must match pre-migration count)
    *   `SELECT COUNT(*) FROM "bookings";` (Must match pre-migration count)
3.  **Connectivity:**
    *   Run `/health` endpoint to verify DB pool status.

---

## 🚨 PRODUCTION DEPLOYMENT ORDER

1.  **Deploy DB migrations** (Phased).
2.  **Run backfill SQL** (Fix data consistency).
3.  **Deploy backend** (Update API logic to handle new schema).
4.  **Deploy frontend** (Enable new UI components).
5.  **Enable Flags** (Flip `BOOKING_ENABLED` in `system_configs`).

❌ **Never reverse this order.**

---
**Status:** 🟢 PLAN COMPLETE | READY FOR STEP 2