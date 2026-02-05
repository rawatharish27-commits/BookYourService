
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

### 💰 Financial Integrity
- **Escrow-like Logic:** Funds held until service completion.
- **Ledger System:** Immutable record of Credits, Debits, and Commissions.
- **Webhook-First Payments:** Zero-trust frontend payment verification.

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

### 3. Access
- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:4000
- **Database:** Port 5432

### 4. Seed Data
```bash
# Run inside backend container or locally
npm run seed:prod
```

---

## 📂 Project Structure

```
/
├── backend/             # Node.js Express API
│   ├── src/
│   │   ├── config/      # Env & DB Config
│   │   ├── controllers/ # Business Logic
│   │   ├── middlewares/ # Auth, Fraud, Validation
│   │   └── ...
│   └── Dockerfile
├── src/                 # React Frontend
│   ├── pages/           # Client, Provider, Admin Pages
│   ├── context/         # Auth & Toast Context
│   └── ...
├── nginx/               # Reverse Proxy Config
├── docker-compose.yml   # Orchestration
└── ...
```

---

## 📜 Documentation

- **[SYSTEM_REQUIREMENTS.md](./SYSTEM_REQUIREMENTS.md):** The core "Contract" of rules.
- **[EXECUTION_ROADMAP.md](./EXECUTION_ROADMAP.md):** Day-by-day plan for Go-Live.
- **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md):** QA Sign-off sheet.
- **[DEPLOYMENT.md](./DEPLOYMENT.md):** Server setup guide.

---

## 🧪 Testing

```bash
cd backend
npm test
```

---

## 📦 Production Build

The system is fully Dockerized.
1. Set `NODE_ENV=production` in `.env`
2. Update `DATABASE_URL` to a managed instance (AWS RDS / Supabase).
3. Deploy via `docker-compose -f docker-compose.yml up -d`.

---

**Status:** ✅ PRODUCTION READY
