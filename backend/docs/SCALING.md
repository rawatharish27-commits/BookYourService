# 🚀 SCALABLE MICROSERVICE ARCHITECTURE (ZERO-GAP)
# ============================================
# Author: Senior Developer / CTO
# Tech Stack: Node.js + Express + TypeScript + Event-Driven
# Type: Production-Grade (Scaling Guide)
# 
# IMPORTANT:
# 1. This guide defines how to split Monolith into Microservices.
# 2. It defines Phase 1 (10k bookings/day) vs. Phase 2 (100k+ bookings/day).
# 3. It defines Communication (REST vs. Events).
# 4. It defines Data Ownership (Read-Only vs. Read-Write).
# 5. It defines Deployment Strategy (Docker + K8s).
# ============================================

# ============================================
# CURRENT STATE (MONOLITH - MVP)
# ============================================

> **Single API (`api/v1`)**
> - Auth Service
> - Booking Service
> - Matching Service
> - Payment Service
> - Notification Service
> - Admin Service

> **Pros:** Simple, Fast to build.
> **Cons:** Tight coupling, Hard to scale, Single point of failure.

---

# ============================================
# PHASE 1 (10k+ BOOKINGS/DAY) - STRATEGIC SPLIT
# ============================================

### **Goal:** Decouple business logic into services.
### **Tech:** Shared DB + REST Communication (For Simplicity in Phase 1).

## 📊 SERVICES ARCHITECTURE

### **1. AUTH SERVICE**
> **Responsibility:** User Authentication, OTP, Session Management.
> **Endpoints:**
> - `POST /auth/otp/send`
> - `POST /auth/otp/verify`
> - `POST /auth/login`
> - `POST /auth/logout`
> - `GET /auth/me`
> **Data Access:** `User`, `OTP` tables (Read-Write).
> **Event Emitters:** `user.login`, `user.logout`.
> **Event Consumers:** None (Phase 1).

### **2. BOOKING SERVICE**
> **Responsibility:** Booking Management, Status Transitions, Customer Operations.
> **Endpoints:**
> - `POST /booking` (Create)
> - `GET /booking/my` (List)
> - `PUT /booking/:id/cancel` (Cancel)
> **Data Access:** `Booking`, `Service` tables (Read-Write).
> **Event Emitters:** `booking.created`, `booking.cancelled`.
> **Event Consumers:** None (Phase 1).

### **3. MATCHING SERVICE**
> **Responsibility:** Provider Filtering, Scoring, Auto-Assignment.
> **Endpoints:**
> - `POST /matching/assign/:bookingId` (Auto-Assign)
> - `POST /matching/force-assign/:bookingId/:providerId` (Admin Override)
> **Data Access:** `Booking`, `Service`, `Provider` tables (Read-Only, Updates via API).
> **Event Emitters:** None.
> **Event Consumers:** `booking.created` (Triggers Auto-Assign).

### **4. PAYMENT SERVICE**
> **Responsibility:** Payment Processing, Webhooks, Wallet Management, Refunds.
> **Endpoints:**
> - `POST /payment/process` (Capture)
> - `POST /payment/webhook/:gateway` (Callback)
> - `GET /payment/wallet` (Balance)
> - `POST /payment/refund` (Refund)
> **Data Access:** `Payment`, `Wallet`, `Ledger` tables (Read-Write).
> **Event Emitters:** `payment.captured`, `payment.released`, `payment.refunded`.
> **Event Consumers:** `booking.completed` (Triggers Payment Release).

### **5. PROVIDER SERVICE**
> **Responsibility:** Provider Operations, Job Acceptance, Job Completion.
> **Endpoints:**
> - `POST /provider/job/accept` (Accept Job)
> - `POST /provider/job/start` (Start Job - OTP)
> - `POST /provider/job/complete` (Complete Job)
> - `GET /provider/jobs` (My Jobs)
> **Data Access:** `Booking` (Read-Only, Updates via API), `Provider` (Read-Write).
> **Event Emitters:** `job.accepted`, `job.started`, `job.completed`.
> **Event Consumers:** `booking.assigned` (Triggers Job Acceptance).

### **6. NOTIFICATION SERVICE**
> **Responsibility:** SMS/Push Notifications, Email.
> **Endpoints:**
> - `POST /notification/sms` (Send SMS)
> - `POST /notification/push` (Send Push)
> - `POST /notification/email` (Send Email)
> **Data Access:** `Notification` table (Read-Write).
> **Event Emitters:** None.
> **Event Consumers:** All services (Auth, Booking, Matching, Payment, Provider) send events to this service (e.g., `user.login` -> Send Welcome SMS).

### **7. ADMIN SERVICE**
> **Responsibility:** Admin Dashboard Stats, User/Provider/Booking Management, Refund Approval.
> **Endpoints:**
> - `GET /admin/stats`
> - `GET /admin/users` (List)
> - `GET /admin/bookings` (List)
> - `POST /admin/refund` (Process Refund)
> - `POST /admin/force-assign` (Admin Override)
> **Data Access:** Read-Only access to ALL tables.
> **Event Emitters:** `admin.action`.
> **Event Consumers:** None.

---

# ============================================
# PHASE 2 (100k+ BOOKINGS/DAY) - EVENT-DRIVEN ARCHITECTURE
# ============================================

### **Goal:** Scale independent services, Remove synchronous calls, Use Event Bus.
### **Tech:** Shared DB + Event Bus (RabbitMQ / Redis Pub/Sub).

## 📊 EVENT-DRIVEN ARCHITECTURE

### **1. GATEWAY API (API GATEWAY)**
> **Responsibility:** Route incoming requests, Basic Auth, Rate Limiting.
> **Endpoints:** Exposes all service endpoints (Auth, Booking, Payment, etc.) via `/api/v1`.
> **Data Access:** None (Only routing).
> **Event Emitters:** Publishes events to Event Bus after processing request.
> **Event Consumers:** None.

### **2. EVENT BUS (RABBITMQ / REDIS)**
> **Responsibility:** Decouples services, handles async processing.
> **Queues:**
> - `auth_queue`
> - `booking_queue`
> - `matching_queue`
> - `payment_queue`
> - `notification_queue`
> - `provider_queue`
> - `admin_queue`

---

## 🔄 EVENT FLOW (REAL-LIFE EXAMPLE)

### **EXAMPLE 1: CUSTOMER BOOKS A SERVICE**

1.  **Gateway API** (`POST /booking`):
    *   Validates Request (Service Exists, etc.).
    *   Creates Booking (Status: `DRAFT`).
    *   Publishes Event: `booking.created` (Payload: `{ bookingId, serviceId, customerId }`).

2.  **Booking Service** (Subscribes to `booking_queue`):
    *   Receives Event `booking.created`.
    *   Updates Booking Status to `PENDING_ASSIGNMENT`.

3.  **Matching Service** (Subscribes to `matching_queue`):
    *   Receives Event `booking.created` (Triggered by Booking Service or Gateway).
    *   Filters Providers (City, Skill, Rating).
    *   Scores Providers.
    *   Assigns Best Provider (Status: `ASSIGNED`).
    *   Publishes Event: `booking.assigned` (Payload: `{ bookingId, providerId }`).

4.  **Notification Service** (Subscribes to `notification_queue`):
    *   Receives Event `booking.assigned`.
    *   Sends Push Notification to Provider ("New Job Assigned").
    *   Sends SMS to Provider ("New Job Assigned").

5.  **Provider Service** (Subscribes to `provider_queue`):
    *   Receives Event `booking.assigned`.
    *   Updates Provider App State ("You have new job").

---

### **EXAMPLE 2: PROVIDER ACCEPTS JOB**

1.  **Provider Service** (`POST /provider/job/accept`):
    *   Validates Provider is assigned.
    *   Updates Booking Status to `PROVIDER_ACCEPTED`.
    *   Publishes Event: `job.accepted` (Payload: `{ bookingId, providerId }`).

2.  **Notification Service** (Subscribes to `notification_queue`):
    *   Receives Event `job.accepted`.
    *   Sends Push Notification to Customer ("Provider accepted your job").

---

### **EXAMPLE 3: PROVIDER COMPLETES JOB**

1.  **Provider Service** (`POST /provider/job/complete`):
    *   Validates Job is `IN_PROGRESS`.
    *   Updates Booking Status to `COMPLETED`.
    *   Publishes Event: `job.completed` (Payload: `{ bookingId, providerId, customerId }`).

2.  **Payment Service** (Subscribes to `payment_queue`):
    *   Receives Event `job.completed`.
    *   Calculates Commission (20%).
    *   Credits Provider Wallet (80% of Price).
    *   Updates Payment Status to `RELEASED`.
    *   Publishes Event: `payment.released` (Payload: `{ paymentId, bookingId }`).

3.  **Notification Service** (Subscribes to `notification_queue`):
    *   Receives Event `payment.released`.
    *   Sends SMS to Provider ("Money released to your wallet").

---

# ============================================
# DEPLOYMENT STRATEGY (DOCKER + K8S)
# ============================================

### **Phase 1 (Monolith -> Services):**

1.  **Containerize:** Create `Dockerfile` for each service (`auth-service`, `booking-service`, etc.).
2.  **Registry:** Push images to Docker Hub (or ECR).
3.  **Compose:** Use `docker-compose.yml` for local dev.

### **Phase 2 (Services -> K8s):**

1.  **K8s Deployment:** Create `deployment.yaml`, `service.yaml` for each service.
2.  **Load Balancer:** Nginx Ingress Controller (Routes `/api/v1/auth` to `auth-service`, etc.).
3.  **Scaling:** `kubectl scale deployment auth-service --replicas=3`.
4.  **Event Bus:** Deploy RabbitMQ/Redis to K8s.

---

# ============================================
# DATA OWNERSHIP RULES (CRITICAL)
# ============================================

| Service         | Table         | Permission |
| ---------------- | -------------- | ----------- |
| Auth Service    | User, OTP     | Read-Write |
| Booking Service | Booking       | Read-Write |
| Matching Service | Provider      | Read-Only (Updates via API) |
| Payment Service  | Payment, Wallet, Ledger | Read-Write |
| Provider Service | Booking       | Read-Only (Updates via API) |
| Admin Service   | ALL TABLES     | Read-Only |
| Notification Service | Notification | Read-Write |

> **Note:** Phase 2 uses Event Bus to decouple, so services don't need direct DB access for other tables.

---

# ============================================
# FINAL REALITY CHECK
# ============================================

> **Scaling is not magic.**
> It requires:
> 1.  **Architectural Discipline** (Services must be independent).
> 2.  **Data Discipline** (No shared state, Event-driven).
> 3.  **Operational Discipline** (Monitoring, Alerts, Scaling policies).

> **अगर तुम इस guide follow करो तो:**
> 1.  **Monolith -> Services:** Decouple logic (Auth, Booking, Matching, etc.).
> 2.  **Services -> Events:** Use RabbitMQ/Redis for async processing.
> 3.  **Events -> K8s:** Scale independent services independently.
> 4.  **K8s -> 100k+ bookings/day:** High availability, low latency.

---

# ============================================
# FINAL STATUS
# ============================================

> **Status:** PRODUCTION-READY (SCALING GUIDE)
> **Coverage:** Monolith -> Phase 1 -> Phase 2.
> **Documentation:** Complete (Services, Endpoints, Events, Data Access, Deployment).
