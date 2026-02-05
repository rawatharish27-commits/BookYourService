
# 🚀 DEPLOYMENT & PRODUCTION GUIDE

## 1. INFRASTRUCTURE OVERVIEW

| Component | Technology | Docker Image | Port |
|-----------|------------|--------------|------|
| **Frontend** | React + Nginx (Alpine) | `frontend:latest` | 80/443 |
| **Backend** | Node.js + Express (Alpine) | `backend:latest` | 4000 |
| **Database** | PostgreSQL 15 | `postgres:15-alpine` | 5432 |

---

## 2. DEPLOYMENT INSTRUCTIONS

### A. Pre-requisites
1. Server with Docker & Docker Compose installed (Ubuntu 22.04 LTS recommended).
2. Domain pointed to server IP.
3. SSL Certificates generated (e.g., via Let's Encrypt).

### B. Environment Variables
Create a `.env` file on the production server (DO NOT COMMIT THIS):

```env
# Backend
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:strong_password@db:5432/bookyourservice
JWT_SECRET=generate_random_64_char_string
JWT_REFRESH_SECRET=generate_random_64_char_string
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
CORS_ORIGIN=https://yourdomain.com

# Database Container Variables
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=strong_password
POSTGRES_DB=bookyourservice
```

### C. Deploy Command
```bash
docker-compose down
docker-compose pull
docker-compose up -d --build
```

---

## 3. ZERO-DOWNTIME STRATEGY (Rolling Update)

For zero downtime without Kubernetes, use Nginx blue-green:
1. Spin up new container on port 4001.
2. Wait for Healthcheck (`/health`).
3. Update Nginx upstream to point to 4001.
4. Reload Nginx (`nginx -s reload`).
5. Kill old container.

---

## 4. DISASTER RECOVERY (DR) PLAN

### Scenario A: Database Corruption
**Recovery Time Objective (RTO):** 1 Hour
**Recovery Point Objective (RPO):** 24 Hours

1. **Stop Application:** `docker-compose stop backend`
2. **Locate Backup:** Check S3 bucket `s3://bys-backups/db/`
3. **Restore:**
   ```bash
   cat backup_YYYY_MM_DD.sql | docker exec -i bys-db-1 psql -U prod_user -d bookyourservice
   ```
4. **Restart:** `docker-compose start backend`

### Scenario B: Payment Gateway Failure
1. Admin switches `ENABLE_BOOKINGS` config to `false` via Admin Panel.
2. Banner shown on Frontend: "Maintenance Mode".
3. Wait for Gateway status page resolution.

---

## 5. MONITORING & ALERTS

- **Logs:** `docker logs -f bys-backend-1` (Ship to ELK/Datadog).
- **Uptime:** `/health` endpoint monitored by UptimeRobot.
- **Metrics:** `/api/admin/metrics` endpoint provides business health stats.

---

## 6. SECURITY HARDENING CHECKLIST

- [ ] **Secrets:** `JWT_SECRET` rotated every 90 days.
- [ ] **Network:** Database port `5432` blocked from external access (Docker internal network only).
- [ ] **SSL:** Force HTTPS in Nginx config.
- [ ] **Headers:** `X-Frame-Options` and `CSP` verified.
- [ ] **Updates:** `npm audit` run weekly to patch vulnerability.
