
# 🛠️ BookYourService - Production Ready Marketplace

> A robust, type-safe, and scalable Service Marketplace connecting Clients with Professionals.
> Built with **React 18, Node.js, PostgreSQL, and Docker**.

---

## 🌟 Key Features

### 🔐 Security & Governance
- **Role-Based Access Control (RBAC):** Strict separation of Client, Provider, and Admin.
- **Secure Authentication:** HttpOnly Cookies, JWT Rotation, Brute-force protection.
- **Fraud Prevention:** Rate limiting, Booking limits, and ID verification.

### 💼 Marketplace Engine
- **State Machine Booking:** Strict lifecycle (`PENDING` -> `ACCEPTED` -> `IN_PROGRESS` -> `COMPLETED`).
- **Standardized Catalog:** Template-based service creation to ensure quality.
- **Slot Locking:** Prevents double-booking concurrency issues.

---

## 📜 Documentation Hub

- **[ARCHITECTURE.md](./ARCHITECTURE.md):** High-level system design and scaling strategies.
- **[ROADMAP.md](./ROADMAP.md):** The 12-month strategic vision.
- **[SYSTEM_REQUIREMENTS.md](./SYSTEM_REQUIREMENTS.md):** The core "Contract" of rules.
- **[EXECUTION_ROADMAP.md](./EXECUTION_ROADMAP.md):** Day-by-day plan for Go-Live.
- **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md):** QA Sign-off sheet.
- **[DEPLOYMENT.md](./DEPLOYMENT.md):** Server setup guide.

---

## 🚀 Quick Start (Local Dev)

### 1. Prerequisites
- Node.js 20+
- Docker & Docker Compose

### 2. Run the Stack
```bash
# Start DB, Backend, and Frontend via Docker
docker-compose up --build
```

### 3. Seed Data
```bash
# Run inside backend container or locally
npm run seed:prod
```

---

**Status:** ✅ PRODUCTION READY
