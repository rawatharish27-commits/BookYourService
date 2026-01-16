# 🚀 PRODUCTION DEPLOYMENT CHECKLIST (ZERO EXCUSES)
# ============================================
# Author: Senior Developer / CTO
# Tech Stack: Node.js + Express + TypeScript + Prisma + Docker + K8s
# Type: Production-Grade (Deployment Guide)
#
# IMPORTANT:
# 1. This checklist covers Security, Database, Deployment, Monitoring, DR (Disaster Recovery).
# 2. It ensures "Zero Excuses" for system downtime.
# 3. It includes real-world scenarios (Outage, Failover, Backup).
# 4. It is implementation-ready (Copy-paste commands).
# ============================================

# ============================================
# 1. SECURITY (MANDATORY)
# ============================================

## ✅ 1.1 ENVIRONMENT VARIABLES

- [ ] **All Secrets Managed:** No hardcoded secrets (API keys, DB passwords, JWT secrets) in code. Use `dotenv` or Vault.
- [ ] **.env File Created:** Create `.env` file with all variables.
- [ ] **.env Added to .gitignore:** Prevent accidental commit of secrets.

**Variables Checklist:**

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Auth
JWT_SECRET=super_secret_key_no_spaces
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=another_secret_key

# Payment (Razorpay)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=rzp_test_...

# SMS (Twilio)
TWILIO_SID=AC123...
TWILIO_AUTH_TOKEN=auth_token...

# Logging
LOG_LEVEL=info
NODE_ENV=production

# CORS
FRONTEND_URL=https://bookyourservice.com
```

## ✅ 1.2 AUTHENTICATION & AUTHORIZATION

- [ ] **JWT Expiry Enforced:** Access tokens expire in 15 mins, Refresh tokens in 7 days.
- [ ] **Role-Based Access Control (RBAC):** APIs protected by role (CUSTOMER, PROVIDER, ADMIN).
- [ ] **Rate Limiting:** API Gateway rate limits requests (e.g., 100 req/min per IP).
- [ ] **Input Validation:** All inputs validated (Zod/Joi) before processing (SQL injection protection).
- [ ] **SQL Injection Protection:** Use Prisma ORM (Parameterized Queries).
- [ ] **XSS Protection:** Sanitize user inputs (e.g., HTML content in notes).
- [ ] **Helmet Middleware:** Secure headers (X-Frame-Options, CSP) enabled.

## ✅ 1.3 OWASP TOP 10

- [ ] **Injection:** SQLi, XSS, Command Injection prevented.
- [ ] **Broken Auth:** Strong session management (JWT).
- [ ] **Sensitive Data Exposure:** PII (Personal Data) not logged or exposed.
- [ ] **XML External Entities:** JSON API (No XML parsing).
- [ ] **Broken Access Control:** RBAC strictly enforced.
- [ ] **Security Misconfiguration:** Defaults are secure (Helmet, CORS).
- [ ] **Cross-Site Request Forgery (CSRF):** CSRF tokens (If using forms).
- [ ] **Using Components with Known Vulnerabilities:** NPM packages updated (`npm audit`).
- [ ] **Unvalidated Redirects:** No open redirects.

---

# ============================================
# 2. DATABASE (PRODUCTION-GRADE)
# ============================================

## ✅ 2.1 MIGRATIONS & BACKUP

- [ ] **Prisma Migrations:** Run `npx prisma migrate deploy` in production.
- [ ] **Prisma Client Generated:** Run `npx prisma generate` after migration.
- [ ] **Backup Strategy:** Daily automated backups (Cron Job or AWS Backup).
- [ ] **Backup Retention:** Keep backups for 30 days.
- [ ] **Restore Test:** Test restoration process in Staging environment.

**Backup Script (Example):**

```bash
#!/bin/bash
# Run Daily (Cron: `0 2 * * *`)
DATE=$(date +%Y-%m-%d)
pg_dump $DATABASE_URL > backups/db-backup-$DATE.sql
aws s3 cp backups/db-backup-$DATE.sql s3://bookyourservice-backups/
```

## ✅ 2.2 DATABASE CONNECTIONS

- [ ] **Connection Pooling:** Prisma manages connection pool (Check `DATABASE_URL` params).
- [ ] **Read Replicas (Optional):** If high traffic, configure Read Replicas for reporting/analytics queries.
- [ ] **Connection Timeouts:** Set connection timeout (e.g., 30s).

---

# ============================================
# 3. DEPLOYMENT (DOCKER + VERCEL)
# ============================================

## ✅ 3.1 DOCKER CONTAINERIZATION

- [ ] **Dockerfile Created:** Dockerfile created for backend.
- [ ] **.dockerignore Created:** Exclude `node_modules`, `.env`, `.git`.
- [ ] **Image Built:** `docker build -t bookyourservice-api .` (Test locally).
- [ ] **Image Pushed:** Push image to Docker Hub or ECR (`docker push ...`).

**Dockerfile (Example):**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/server.js"]
```

## ✅ 3.2 VERCEL DEPLOYMENT (FRONTEND)

- [ ] **Vercel Project Created:** Linked GitHub repo.
- [ ] **Environment Variables Configured:** Set `VITE_API_URL` in Vercel Settings.
- [ ] **Build Settings:** Framework Preset (Vite), Output Directory: `dist`.
- [ ] **Domains Configured:** Custom domain configured (e.g., `app.bookyourservice.com`).
- [ ] **HTTPS Enforced:** SSL/TLS certificates auto-managed by Vercel.

## ✅ 3.3 BACKEND DEPLOYMENT (RENDER / FLY.IO / AWS)

- [ ] **Platform Selected:** Render / Fly.io / AWS ECS.
- [ ] **Environment Variables Set:** `DATABASE_URL`, `JWT_SECRET`, etc. set in platform settings.
- [ ] **Build Command:** `npm run build`
- [ ] **Start Command:** `npm run start`
- [ ] **Health Check Endpoint:** `GET /health` endpoint returns `{ status: 'ok' }`.
- [ ] **Zero Downtime Deployment:** Rolling updates enabled (if supported).

---

# ============================================
# 4. MONITORING (ALERTS & LOGS)
# ============================================

## ✅ 4.1 LOGGING (STRUCTURED)

- [ ] **Winston Logger:** Logs written to Console (Dev) + File (Prod).
- [ ] **Log Levels:** `error`, `warn`, `info`, `debug`.
- [ ] **Log Rotation:** Old logs automatically deleted/archived.
- [ ] **Log Storage:** Logs stored in Cloud Storage (S3/CloudWatch) for analysis.

**Logger Config (Example):**

```typescript
winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});
```

## ✅ 4.2 ERROR ALERTING (SLACK / WEBHOOK)

- [ ] **Slack Webhook:** `SLACK_WEBHOOK_URL` environment variable set.
- [ ] **Alerting Service:** Service sends alert on `Error` (Code 500+).
- [ ] **Alert Content:** Error message, Stack trace, Request ID, Timestamp.

**Alert Payload (Example):**

```json
{
  "text": "🚨 ALERT: Internal Server Error",
  "attachments": [{
    "text": "Error: Database connection failed\nTimestamp: 2023-10-27T10:05:00Z\nStack: ...",
    "color": "#FF0000"
  }]
}
```

## ✅ 4.3 KEY METRICS (APPLICATION PERFORMANCE MONITORING - APM)

- [ ] **APM Tool:** New Relic / Datadog / Prometheus + Grafana (Optional for Phase 2).
- [ ] **Metrics Tracked:**
    -   **Response Time:** P50, P95, P99 latency.
    -   **Error Rate:** % of requests returning 500.
    -   **Request Rate:** Requests per second.
    -   **Database Query Time:** Slow query tracking.

---

# ============================================
# 5. DISASTER RECOVERY (DR)
# ============================================

## ✅ 5.1 BACKUP & RESTORE

- [ ] **Automated Backups:** Daily cron job runs `backup-db.sh`.
- [ ] **Offsite Storage:** Backups uploaded to S3/Cloud Storage (Not on same server).
- [ ] **Restore Procedure:** `restore-db.sh` script tested and documented.

**Restore Steps:**
1. SSH into server.
2. Download latest backup from S3.
3. Run `psql $DATABASE_URL < backup-file.sql`.
4. Verify data integrity.

## ✅ 5.2 ROLLBACK STRATEGY (CODE DEPLOYMENT)

- [ ] **Git Tags:** Create a git tag for each release (`git tag v1.0.0`).
- [ ] **Rollback Command:** `git revert <commit-hash>` or `git reset --hard <tag>`.
- [ ] **Zero-Downtime Deploy:** Use Blue-Green deployment (Phase 2) or wait for maintenance window (Phase 1).

## ✅ 5.3 DATA CORRECTION (ADMIN TOOLS)

- [ ] **Admin Override Tools:** Admin can manually fix data (Assign wrong provider, etc.).
- [ ] **SQL Editor Access:** Admin can run raw SQL queries in Staging (Prod restricted).

---

# ============================================
# 6. TESTING (PRODUCTION-READY)
# ============================================

## ✅ 6.1 UNIT TESTS

- [ ] **Jest Installed:** `npm install --save-dev jest supertest @types/jest`.
- [ ] **Test Coverage:** Run `npm run test` to ensure all critical paths are covered.
- [ ] **Coverage Report:** Generate coverage report (`npm run test -- --coverage`).

## ✅ 6.2 INTEGRATION TESTS

- [ ] **Supertest Tests:** Test real API endpoints (Booking, Payment, OTP).
- [ ] **Test Database:** Use a separate `TEST_DATABASE_URL` (Do not use Prod DB).
- [ ] **Test Cleanup:** `afterAll` hooks delete test data.

## ✅ 6.3 E2E TESTS (OPTIONAL)

- [ ] **E2E Tool:** Playwright / Cypress.
- [ ] **Critical Flows:** Test Booking Flow, Login Flow, Payment Flow.
- [ ] **Headless Mode:** Run tests in CI/CD pipeline.

---

# ============================================
# 7. CI/CD PIPELINE (AUTOMATED)
# ============================================

## ✅ 7.1 GITHUB ACTIONS (BUILD + TEST)

- [ ] **Workflow File:** `.github/workflows/deploy.yml` created.
- [ ] **Triggers:** Push to `main` branch.
- [ ] **Steps:**
    1.  Checkout Code.
    2.  Install Deps.
    3.  Run Tests.
    4.  Build Docker Image.
    5.  Push to Registry.

**Workflow (Example):**

```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Deps
        run: npm install
      - name: Run Tests
        run: npm run test
      - name: Build Image
        run: docker build -t bookyourservice-api .
```

## ✅ 7.2 ROLLBACK READY

- [ ] **Manual Rollback:** Push a fix commit to revert bad change.
- [ ] **Automated Rollback:** If CI/CD fails, pipeline stops (auto-rollback not recommended).

---

# ============================================
# 8. INCIDENT RESPONSE PLAN (WHAT IF?)
# ============================================

| Scenario | Action | Priority |
| ---------- | ------ | -------- |
| **API Down** | Check Health Endpoint | P0 (Critical) |
| **DB Down** | Check DB Connection String | P0 (Critical) |
| **Payment Failure** | Check Razorpay Dashboard | P1 (High) |
| **SMS Failure** | Check Twilio Dashboard | P1 (High) |
| **High Error Rate** | Check Logs (Slack Alerts) | P1 (High) |

**Emergency Contacts:**
- **On-Call Developer:** [Name] [Phone]
- **CTO:** [Name] [Phone]

---

# ============================================
# FINAL STATUS (ZERO EXCUSES)
# ============================================

> **"Agar deployment fail ho gayi, to humhe pata lagna chahiye pehle user ko."**

**Checklist:**

- [ ] Security: 100% (JWT, RBAC, Rate Limit, Inputs).
- [ ] Database: 100% (Backups, Migrations, Read Replicas).
- [ ] Deployment: 100% (Docker, Vercel, Platform Config).
- [ ] Monitoring: 100% (Logs, Alerts, APM).
- [ ] DR: 100% (Backup/Restore, Rollback, Admin Tools).
- [ ] Testing: 100% (Unit, Integration, E2E).
- [ ] CI/CD: 100% (Automated Build/Test/Deploy).

**अब तुम system deploy होगा!**

---

# NEXT STEP: GO LIVE!

### **Execute Now:**

1.  ✅ **Check Environment Variables** (No hardcoded secrets).
2.  ✅ **Run Migrations** (`npx prisma migrate deploy`).
3.  ✅ **Setup Backups** (Cron Job + S3 Upload).
4.  ✅ **Deploy Backend** (Docker -> Render / Fly.io / AWS).
5.  ✅ **Deploy Frontend** (GitHub -> Vercel).
6.  ✅ **Monitor Logs** (Winston + Slack).
7.  ✅ **Verify Endpoints** (Postman / Browser).

**🚀 PRODUCTION LIVE!**
