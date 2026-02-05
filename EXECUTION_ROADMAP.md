
# 📅 30-DAY EXECUTION ROADMAP
## From Code Complete to First Dollar Revenue

**Objective:** Launch BookYourService safely with real providers and paying customers.

---

## 🟢 WEEK 1: HARDENING & SECURITY (The "Safe" Phase)

**Goal:** Ensure the system cannot be hacked or exploited.

- [ ] **Day 1: Infrastructure Setup**
  - Provision VPS (DigitalOcean/AWS EC2).
  - Set up PostgreSQL Managed Database (Supabase/RDS) for backups.
  - Configure Domain & SSL (Certbot/Cloudflare).

- [ ] **Day 2: Secret Management**
  - Rotate all `JWT_SECRET` and `API_KEYS`.
  - Move secrets to GitHub Secrets / Environment Variables.
  - Disable SSH password login; enforce Key-based auth.

- [ ] **Day 3: Penetration Testing (Internal)**
  - Run `npm audit` and fix high-severity vulnerabilities.
  - Attempt IDOR attacks on `/bookings/:id` endpoints.
  - Verify Rate Limiting is active on Login API.

- [ ] **Day 4: Logging & Monitoring**
  - Connect Backend logs to a service (Papertrail/Datadog).
  - Set up UptimeRobot for `/health` endpoint.
  - Configure Slack/Discord alerts for 500 Errors.

- [ ] **Day 5: Pre-Flight Drill**
  - Run `npm run preflight` in Production mode.
  - Execute `npm run seed:prod` to populate Roles/Categories.
  - Perform a full Backup & Restore drill.

---

## 🟡 WEEK 2: LEGAL & FINANCIAL (The "Business" Phase)

**Goal:** Ensure money flows correctly and legally.

- [ ] **Day 6: Payment Gateway KYC**
  - Complete Razorpay/Stripe Business Verification.
  - Activate "Live Mode" API Keys.
  - Whitelist Production Domain in Gateway settings.

- [ ] **Day 7: Legal Docs**
  - Draft Terms of Service (Liability clauses).
  - Draft Privacy Policy (Data retention).
  - Draft Provider Agreement (Commission rates & payouts).

- [ ] **Day 8: Financial Dry Run**
  - Create a real Service ($1 price).
  - Book it using a real Credit Card.
  - Verify money lands in Gateway Dashboard.
  - Verify `escrow_ledger` updates in DB.

- [ ] **Day 9: Payout Setup**
  - Define Payout Schedule (e.g., Weekly on Friday).
  - Test the Payout API (Mock bank account).

- [ ] **Day 10: Admin Training**
  - Walkthrough Admin Dashboard with Ops team.
  - Test "Dispute Resolution" flow.
  - Test "Emergency Block" user flow.

---

## 🔵 WEEK 3: SUPPLY SIDE ONBOARDING (The "Liquidity" Phase)

**Goal:** Get 20-50 Verified Providers ready before clients arrive.

- [ ] **Day 11: Beta Invite**
  - Send invites to 50 local service providers.
  - Share "Provider Guide" PDF.

- [ ] **Day 12: KYC Validation**
  - Admin manually reviews incoming KYC docs.
  - Verify Identity & Bank details.
  - Approve qualified providers (`verification_status='APPROVED'`).

- [ ] **Day 13: Service Catalog Populating**
  - Providers create their Service Offerings.
  - Admin reviews pricing and descriptions.
  - Ensure coverage in all primary Zones.

- [ ] **Day 14: Availability Check**
  - Ensure all providers have set "Operating Hours".
  - Conduct a mock booking with 5 random providers to test responsiveness.

- [ ] **Day 15: The "Soft" Launch**
  - System is LIVE but password protected (or hidden).
  - Internal team books services to test real-world coordination.

---

## 🚀 WEEK 4: PUBLIC LAUNCH (The "Traffic" Phase)

**Goal:** Open the floodgates.

- [ ] **Day 16: Marketing Prep**
  - Social Media announcements.
  - Email blast to waitlist.

- [ ] **Day 17: GO LIVE 🔴**
  - Switch DNS to Production.
  - Remove Maintenance Mode.
  - Monitor Logs for the first 4 hours continuously.

- [ ] **Day 18-30: Hyper-Care**
  - Daily review of `admin_logs`.
  - Call every client after service completion for feedback.
  - Manual payouts to providers to build trust.

---

## 🆘 EMERGENCY PROCEDURES

**If Payment Fails:**
1. Check Webhook Logs (`webhook_events` table).
2. Compare with Gateway Dashboard.
3. Manually update Booking Status if money was deducted.

**If Double Booking Occurs:**
1. Admin > Cancel one booking with Full Refund.
2. Offer 10% discount code to affected client.
3. Check `slot_locks` table logic.

**If Data Breach:**
1. Shut down server (`docker-compose down`).
2. Rotate DB passwords.
3. Notify users via Email.
