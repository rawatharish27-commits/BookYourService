# 🚀 BookYourService - Production Deployment Guide

> **Target:** Zero Downtime Production Deployment
> **Difficulty:** Advanced
> **Estimated Time:** 2-3 Hours

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Phase 1: Code Review

- [ ] All TODO items completed
- [ ] Code reviewed by at least 2 developers
- [ ] All security fixes applied
- [ ] No `console.log` or debugging code
- [ ] All environment variables documented
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring configured (Datadog)

### ✅ Phase 2: Testing

- [ ] Unit tests passing (100%)
- [ ] Integration tests passing (100%)
- [ ] E2E tests passing (100%)
- [ ] Manual testing on staging completed
- [ ] Performance benchmarks met
- [ ] Load testing passed (1000 concurrent users)

### ✅ Phase 3: Configuration

- [ ] Supabase project created and configured
- [ ] Database schema applied
- [ ] RLS policies verified
- [ ] Payment gateway accounts created (Razorpay/Stripe)
- [ ] Webhook endpoints configured
- [ ] Environment variables set for all environments
- [ ] SSL certificates configured
- [ ] CDN configured (Cloudflare)
- [ ] Domain DNS configured

---

## 🗄️ STEP 1: SUPABASE SETUP

### 1.1 Create Supabase Project

```bash
# 1. Login to Supabase Dashboard
# https://supabase.com/dashboard

# 2. Click "New Project"
# 3. Enter project name: "bookyourservice-production"
# 4. Choose region: "Mumbai (ap-mumbai-1)"
# 5. Enter database password (save securely)
# 6. Click "Create new project"
# 7. Wait for database to provision (~2 minutes)
```

### 1.2 Apply Database Schema

```bash
# 1. Open SQL Editor in Supabase Dashboard
# 2. Copy contents of: database/production-schema.sql
# 3. Paste into SQL Editor
# 4. Click "Run"
# 5. Verify all tables created successfully

# Check:
# - profiles
# - providers
# - services
# - bookings
# - payments
# - audit_logs
# - reviews
```

### 1.3 Create Service Role (for Edge Functions)

```sql
-- In Supabase SQL Editor
-- Run this to create service role with bypass RLS

-- 1. Create service role
CREATE ROLE service_role;

-- 2. Grant service role bypass RLS
ALTER ROLE service_role BYPASSRLS;

-- 3. Grant access to all public tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 4. Important: Add service_role as a superuser in Supabase
-- This allows Edge Functions to bypass RLS
-- You'll need to contact Supabase support to enable this
```

### 1.4 Configure RLS Policies

```bash
# 1. Go to Authentication → Policies
# 2. Review all RLS policies
# 3. Test each policy:
#    - Customer access: Only own data
#    - Provider access: Only assigned bookings
#    - Admin access: All data
#    - Anonymous access: Public data only

# Test with Supabase Auth User Simulator
```

### 1.5 Enable Realtime

```bash
# 1. Go to Database → Replication
# 2. Enable Realtime for these tables:
#    - profiles
#    - providers
#    - bookings
#    - payments

# 3. Configure Realtime filters (optional)
# 4. Test Realtime subscriptions
```

---

## 🚀 STEP 2: EDGE FUNCTIONS DEPLOYMENT

### 2.1 Install Supabase CLI

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### 2.2 Deploy Edge Functions

```bash
# Navigate to project root
cd /home/z/my-project

# Deploy all Edge Functions
supabase functions deploy

# Deploy individual functions
supabase functions deploy create-payment
supabase functions deploy payment-webhook
```

### 2.3 Configure Environment Secrets

```bash
# Set payment gateway secrets
supabase secrets set RAZORPAY_KEY_ID "rzp_live_your_key_id"
supabase secrets set RAZORPAY_KEY_SECRET "your_key_secret"
supabase secrets set STRIPE_SECRET_KEY "sk_live_your_secret_key"
supabase secrets set STRIPE_WEBHOOK_SECRET "whsec_your_webhook_secret"

# Set Supabase secrets
supabase secrets set SUPABASE_URL "https://your-project.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY "your_service_role_key"

# Verify secrets
supabase secrets list
```

### 2.4 Test Edge Functions

```bash
# Test create-payment function
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test-booking-id",
    "amount": 999,
    "gateway": "razorpay"
  }'

# Expected response:
# {
#   "success": true,
#   "orderId": "order_xxxxxx",
#   "amount": 99900,
#   "currency": "INR",
#   "keyId": "rzp_live_xxxxxx"
# }
```

### 2.5 Configure Payment Webhooks

#### Razorpay Webhook

```bash
# 1. Go to Razorpay Dashboard → Settings → Webhooks
# 2. Add New Webhook
# 3. Webhook URL: https://YOUR_PROJECT_ID.supabase.co/functions/v1/payment-webhook
# 4. Secret: YOUR_WEBHOOK_SECRET (from .env)
# 5. Events to capture:
#    - payment.captured
#    - payment.failed
#    - refund.processed
# 6. Click "Create"
```

#### Stripe Webhook

```bash
# 1. Go to Stripe Dashboard → Developers → Webhooks
# 2. Add Endpoint
# 3. Endpoint URL: https://YOUR_PROJECT_ID.supabase.co/functions/v1/payment-webhook
# 4. Secret: YOUR_WEBHOOK_SECRET (from .env)
# 5. Events to listen:
#    - payment_intent.succeeded
#    - payment_intent.payment_failed
# 6. Click "Add Endpoint"
```

---

## 🌐 STEP 3: VERCEL FRONTEND DEPLOYMENT

### 3.1 Configure Frontend Environment Variables

Create `.env.production` in `/home/z/my-project/frontend/`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key

# API Configuration
VITE_API_BASE_URL=https://bookyourservice.com

# Environment
NODE_ENV=production

# Monitoring
VITE_SENTRY_DSN=https://your-prod-sentry-dsn@sentry.io/project-id

# Feature Flags
VITE_PAYMENTS_ENABLED=true
VITE_NOTIFICATIONS_ENABLED=true
```

### 3.2 Build Frontend

```bash
# Navigate to frontend directory
cd /home/z/my-project/frontend

# Install dependencies
npm ci

# Run type check
npm run type-check

# Run linter
npm run lint

# Build for production
npm run build

# Test build locally (optional)
npm run preview
```

### 3.3 Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# When prompted:
# - Set up and deploy: ~/my-project/frontend
# - Link to existing project: Yes (select bookyourservice-prod)
# - Override settings: No

# Wait for deployment (~2-3 minutes)
# Deployment URL will be displayed
```

### 3.4 Configure Custom Domain

```bash
# 1. Go to Vercel Dashboard → bookyourservice-prod → Settings → Domains
# 2. Add custom domain: bookyourservice.com
# 3. Configure DNS (Vercel will provide instructions)
# 4. Add CNAME/A record to your DNS provider
# 5. Wait for DNS propagation (~5-30 minutes)
# 6. SSL certificate will be automatically provisioned
```

---

## 🔒 STEP 4: SECURITY CONFIGURATION

### 4.1 Enable Cloudflare (CDN + DDoS Protection)

```bash
# 1. Login to Cloudflare Dashboard
# 2. Add your site: bookyourservice.com
# 3. Cloudflare will scan your DNS records
# 4. Update nameservers at your domain registrar
# 5. Wait for nameserver change (~24-48 hours)
# 6. Configure Cloudflare settings:
#    - SSL Mode: Full (Strict)
#    - Always Use HTTPS: On
#    - Auto Minify: On
#    - Brotli: On
#    - Cache Level: Standard
#    - Browser Cache TTL: 4 hours
```

### 4.2 Configure Security Headers

Update `vercel.json` in frontend:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co https://*.razorpay.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.stripe.com https://api.razorpay.com; frame-src 'self' https://js.stripe.com https://checkout.razorpay.com;"
        }
      ]
    }
  ]
}
```

### 4.3 Enable Sentry Error Tracking

Sentry is already configured in `frontend/src/main.tsx`.

```bash
# 1. Verify Sentry DSN in environment variables
# 2. Go to Sentry Dashboard
# 3. Check for incoming errors
# 4. Set up error alerts (email/Slack)
# 5. Configure release tracking
```

### 4.4 Configure Datadog APM Monitoring

```bash
# 1. Install Datadog Agent in frontend
# 2. Configure Datadog API key in environment
# 3. Go to Datadog Dashboard
# 4. Set up monitors:
#    - Frontend uptime
#    - API response time
#    - Error rate
#    - Database performance
# 5. Configure alerts
```

---

## 🧪 STEP 5: POST-DEPLOYMENT TESTING

### 5.1 Smoke Tests

```bash
# 1. Test Homepage
curl https://bookyourservice.com

# 2. Test API Health Check
curl https://bookyourservice.com/api/health

# 3. Test Supabase Connection
# Check browser console for Supabase connection logs

# 4. Test Realtime Subscription
# Create booking and check if realtime update works
```

### 5.2 Functional Tests

**Test All User Flows:**

#### Customer Flow
1. ✓ Sign up as customer
2. ✓ Login
3. ✓ Browse services
4. ✓ Create booking
5. ✓ Make payment (test mode)
6. ✓ View booking history
7. ✓ Leave review
8. ✓ Cancel booking

#### Provider Flow
1. ✓ Sign up as provider
2. ✓ Complete profile setup
3. ✓ View booking requests
4. ✓ Accept booking
5. ✓ Start job
6. ✓ Complete job
7. ✓ View earnings
8. ✓ Set availability

#### Admin Flow
1. ✓ Login as admin
2. ✓ View dashboard analytics
3. ✓ Approve/reject providers
4. ✓ View all bookings
5. ✓ Handle support requests
6. ✓ View audit logs

### 5.3 Payment Tests

**Test Payment Gateway Integration:**

#### Razorpay
1. ✓ Create payment order
2. ✓ Open Razorpay checkout
3. ✓ Make test payment
4. ✓ Verify webhook received
5. ✓ Check database for payment record
6. ✓ Check booking status updated

#### Stripe
1. ✓ Create payment intent
2. ✓ Open Stripe checkout
3. ✓ Make test payment
4. ✓ Verify webhook received
5. ✓ Check database for payment record
6. ✓ Check booking status updated

### 5.4 Security Tests

```bash
# 1. Test RLS Policies
# Try accessing other users' data (should fail)

# 2. Test Authentication
# Try accessing protected routes without auth (should fail)

# 3. Test Input Validation
# Try submitting invalid data (should be rejected)

# 4. Test SQL Injection Protection
# Try SQL injection in search fields (should be safe)

# 5. Test XSS Protection
# Try XSS in comments/notes (should be safe)
```

### 5.5 Performance Tests

```bash
# 1. Run Lighthouse audit
# Target: 90+ Performance score

# 2. Load test with 1000 concurrent users
# Use k6, Artillery, or similar tool

# 3. Database query performance
# Check slow queries in Supabase Dashboard

# 4. Edge Function execution time
# Monitor in Supabase Dashboard
# Target: <500ms for payment order creation
```

---

## 📊 STEP 6: MONITORING SETUP

### 6.1 Dashboard Configuration

#### Supabase Dashboard
```bash
# 1. Enable all logs
# 2. Set up query performance monitoring
# 3. Configure database alerts:
#    - High CPU usage
#    - Slow queries
#    - Failed connections
```

#### Vercel Dashboard
```bash
# 1. Enable deployment notifications
# 2. Set up build failure alerts
# 3. Configure custom domain monitoring
# 4. Enable edge function monitoring
```

#### Cloudflare Dashboard
```bash
# 1. Enable DDoS protection
# 2. Configure firewall rules
# 3. Set up cache purging rules
# 4. Enable bot fight mode
```

### 6.2 Alert Configuration

**Critical Alerts (SMS/Phone):**
- System downtime (>5 min)
- Payment processing failures
- Database connection errors
- Security breaches detected

**Warning Alerts (Email):**
- High error rate (>10/min)
- Slow API response (>2s)
- High CPU usage (>80%)
- Low disk space (<20%)

**Info Alerts (Slack):**
- New user signup
- Large payment (>₹10,000)
- Provider applications
- System deployment completed

---

## 🔧 STEP 7: MAINTENANCE PROCEDURES

### 7.1 Regular Maintenance Tasks

**Daily:**
- [ ] Check error logs in Sentry
- [ ] Review system alerts
- [ ] Verify payment processing
- [ ] Check database performance

**Weekly:**
- [ ] Review slow queries
- [ ] Check disk space
- [ ] Review security events
- [ ] Update dependencies

**Monthly:**
- [ ] Database backup verification
- [ ] Performance review
- [ ] Cost analysis
- [ ] Security audit
- [ ] Update SSL certificates

**Quarterly:**
- [ ] Full security audit
- [ ] Disaster recovery testing
- [ ] Performance optimization
- [ ] Capacity planning

### 7.2 Backup Strategy

**Database Backups:**
- Automatic daily backups (Supabase)
- 7-day retention period
- Point-in-time recovery enabled
- Off-site backup storage (optional)

**Code Backups:**
- Git version control
- Tagged releases
- 3-month code retention
- CI/CD pipeline backups

### 7.3 Disaster Recovery Plan

**In Case of Major Outage:**

1. **Identify Issue**
   - Check dashboards
   - Review logs
   - Ping team

2. **Assess Impact**
   - Determine affected services
   - Estimate downtime
   - Notify stakeholders

3. **Execute Recovery**
   - Restore from backup (if needed)
   - Deploy fix
   - Verify services

4. **Post-Mortem**
   - Document incident
   - Identify root cause
   - Implement fixes
   - Update procedures

---

## 📞 STEP 8: SUPPORT HANDOVER

### 8.1 Documentation Delivery

Ensure all documentation is delivered:
- [ ] Technical Documentation
- [ ] API Documentation
- [ ] RLS Policies Documentation
- [ ] Deployment Guide
- [ ] Maintenance Procedures
- [ ] Troubleshooting Guide

### 8.2 Access Handover

Provide access credentials securely:
- [ ] Supabase Dashboard access
- [ ] Vercel Dashboard access
- [ ] Cloudflare Dashboard access
- [ ] Sentry Dashboard access
- [ ] Datadog Dashboard access
- [ ] Payment gateway dashboards access
- [ ] Domain registrar access
- [ ] DNS provider access

### 8.3 Training

Provide training for:
- [ ] Support team on common issues
- [ ] DevOps team on deployment procedures
- [ ] Development team on codebase
- [ ] Admin team on dashboard usage

---

## 🎉 CONCLUSION

**Deployment Status:** ✅ PRODUCTION LIVE

**Platform URL:** https://bookyourservice.com

**Key Deliverables:**
- ✅ Supabase database with RLS
- ✅ Edge Functions (Payments)
- ✅ Vercel frontend deployment
- ✅ Cloudflare CDN + DDoS protection
- ✅ Sentry error tracking
- ✅ Datadog APM monitoring
- ✅ Payment gateway integration (Razorpay/Stripe)
- ✅ Complete documentation

**Next Steps:**
1. Monitor system for first 24 hours
2. Address any issues promptly
3. Collect user feedback
4. Plan next feature release

---

**Deployment Completed By:** [Your Name]
**Deployment Date:** [Date]
**Deployment Version:** 2.0.0
