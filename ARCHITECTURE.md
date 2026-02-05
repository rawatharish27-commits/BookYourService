
# 🏛️ BookYourService: Enterprise Architecture Document

## 1. High-Level System Interactions
BookYourService (BYS) is built on a **Stateless Micro-Modular Architecture** designed for high availability and strict financial integrity.

### 🛰️ The Communication Flow
1.  **Request Layer:** React SPA communicates via REST with a hardened Express.js API.
2.  **Security Layer:** Nginx acts as the primary gatekeeper, enforcing SSL, Rate Limiting, and CSP headers.
3.  **Authority Layer:** Auth is handled via dual-token JWTs with **Token Versioning**, allowing for instant global session revocation—a critical feature for security-conscious marketplaces.
4.  **Transaction Layer:** All booking states are governed by a strict **State Machine**. Transitions (e.g., `PENDING` -> `ACCEPTED`) are atomic database operations.

---

## 2. Scaling Strategies (The 10x Plan)

### 🏎️ Redis Caching Layer (Phase 2)
To handle 10,000+ concurrent users, we will implement:
*   **Search Caching:** Pre-computed results for popular category/zone combinations.
*   **Session Management:** Moving JWT blacklists and rate-limit counters to Redis for sub-millisecond response times.

### 📊 Database Optimization
*   **Read Replicas:** We utilize a Read/Write split. Critical booking writes hit the Primary, while public discovery and catalog searches hit Read Replicas.
*   **Horizontal Sharding:** Planned for geographical scaling (e.g., Shard A for North India, Shard B for South India) to minimize latency and manage massive row counts.

---

## 3. Data Integrity & Security

### 💰 The "Zero-Trust" Payment Ledger
*   **Webhook Authority:** We never trust the client-side success callback. Booking status is updated *only* via verified HMAC-SHA256 signatures from Razorpay.
*   **Atomic Escrow:** Funds are held in a virtual ledger (`escrow_ledger`). Payouts to `provider_wallet` occur only upon `CUSTOMER_CONFIRMED` or `ADMIN_OVERRIDE`, ensuring buyer protection.

### 🛡️ Layered Security
*   **L1 (Network):** DB ports are isolated; only the Backend container can communicate with PostgreSQL.
*   **L2 (App):** Input sanitization, Helmet headers, and recursive object scrubbing for logs.
*   **L3 (Governance):** `AdminAuditLog` records every override, ensuring full transparency.

---

## 4. Operational Excellence
*   **Health Monitoring:** Deep health checks monitor DB pool health and event-loop latency.
*   **Disaster Recovery:** RPO < 15 mins via WAL (Write Ahead Logging) archiving and hourly S3 snapshots.

---
**Status:** 🟢 Production Ready
**Version:** 1.0.0
