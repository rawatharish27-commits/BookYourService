# 📚 BookYourService - Full Technical Documentation

> **Version:** 2.0.0 (Production-Grade)
> **Last Updated:** 2025-04-19
> **Status:** ✅ Ready for Production Deployment

---

## 🎯 Executive Summary

BookYourService is an enterprise-grade service booking platform built with:
- **Frontend:** React + Vite + Tailwind
- **Backend:** Supabase (Auth + DB + Edge Functions)
- **Payments:** Razorpay/Stripe (Secure Server-Side)
- **Realtime:** Supabase Realtime + WebSockets
- **Security:** RLS (Row Level Security) + JWT + Signature Verification

---

## 📐 SECTION 1: SYSTEM ARCHITECTURE

### 1.1 Technology Stack

#### Frontend Layer
```
Frontend/
├── React 18.3.1
├── TypeScript 5.7.0
├── Vite 5.4.21
├── Tailwind CSS 3.4.14
├── React Router DOM 6.26.2
├── Supabase JS Client 2.90.1
└── Recharts 2.15.0 (Analytics)
```

#### Backend Layer
```
Backend/
├── Supabase Auth (JWT + Session Management)
├── Supabase Database (PostgreSQL + RLS)
├── Supabase Edge Functions (Serverless)
├── Prisma ORM (Type-safe DB queries)
└── Node.js + Express (Legacy - migrating to Supabase)
```

#### Payment Layer
```
Payments/
├── Razorpay (Primary)
├── Stripe (Secondary)
└── Webhook Signature Verification (Mandatory)
```

#### Infrastructure Layer
```
Infrastructure/
├── Vercel (Frontend Hosting)
├── Supabase Cloud (Backend Hosting)
├── Cloudflare (CDN + DDoS Protection)
├── Sentry (Error Tracking)
└── Datadog (APM Monitoring)
```

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
│                  (React + Tailwind)                   │
└────────────┬────────────────────────────────────────────┘
             │
             │ HTTPS
             │
┌────────────▼────────────────────────────────────────────┐
│              VERCEL (CDN)                           │
│         (Static Assets + SPA)                         │
└────────────┬────────────────────────────────────────────┘
             │
             │ API Calls
             │
┌────────────▼────────────────────────────────────────────┐
│              SUPABASE CLOUD                          │
│  ┌────────────────────────────────────────────┐       │
│  │  Supabase Auth (JWT)               │       │
│  │  Supabase DB (PostgreSQL + RLS)    │       │
│  │  Supabase Realtime (WebSockets)     │       │
│  │  Supabase Edge Functions (Deno)      │       │
│  └────────────────────────────────────────────┘       │
└────────────┬────────────────────────────────────────────┘
             │
             │ Webhooks / API
             │
┌────────────▼────────────────────────────────────────────┐
│           PAYMENT GATEWAYS                            │
│    (Razorpay + Stripe)                              │
└───────────────────────────────────────────────────────────┘
```

---

## 🔐 SECTION 2: SECURITY ARCHITECTURE

### 2.1 Authentication Flow

```
1. User Signup/Login
   ↓
2. Supabase Auth creates JWT
   ↓
3. JWT stored in HttpOnly cookie
   ↓
4. Refresh token rotation enabled
   ↓
5. Email verification required
```

### 2.2 Authorization Model

**Role-Based Access Control (RBAC) with RLS:**

| Role       | Permissions                                                                 |
|-----------|----------------------------------------------------------------------------|
| Customer   | - View own bookings<br>- Create bookings<br>- Cancel bookings<br>- Leave reviews |
| Provider   | - View assigned bookings<br>- Accept/Reject bookings<br>- Update own profile |
| Admin      | - Full system access<br>- Approve/reject providers<br>- View all data     |

### 2.3 Row Level Security (RLS) Policies

**Core RLS Rules:**

1. **Customers** can only access their own data
2. **Providers** can only access bookings assigned to them
3. **Admins** have full access to all tables
4. **Anonymous** users have read-only access to public data
5. **Service Role** (Edge Functions) have write access to payments

**RLS Implementation:**

```sql
-- Example: Customers can only see their own bookings
CREATE POLICY "customers_view_own_bookings" ON bookings
  FOR SELECT
  USING (customer_id = auth.uid());

-- Example: Providers can only update their assigned bookings
CREATE POLICY "providers_update_assigned_bookings" ON bookings
  FOR UPDATE
  USING (provider_id = auth.uid())
  WITH CHECK (
    provider_id = auth.uid()
    AND status IN ('accepted', 'in_progress', 'completed')
  );

-- Example: Admins can view all bookings
CREATE POLICY "admins_view_all_bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

### 2.4 Payment Security

**Mandatory Security Measures:**

1. **Server-Side Order Creation**
   - Frontend NEVER creates payment orders
   - Edge Function only (secure environment)

2. **Webhook Signature Verification**
   - Razorpay/Stripe webhooks MUST be verified
   - Prevents fake payment notifications
   - Signature validation before DB updates

3. **Amount Validation**
   - Amount validated against booking total
   - Prevents tampering from frontend

4. **Order Expiry**
   - Orders expire after 15 minutes
   - Prevents replay attacks

---

## 💾 SECTION 3: DATABASE SCHEMA

### 3.1 Core Tables

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('customer', 'provider', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `providers`
```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  experience INT DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  city TEXT NOT NULL,
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_jobs INT DEFAULT 0,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `bookings`
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  provider_id UUID REFERENCES providers(id),
  service_id UUID REFERENCES services(id),
  service_title TEXT,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled', 'no_show')),
  booking_date DATE NOT NULL,
  booking_time TIME,
  notes TEXT,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

#### `payments`
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  order_id TEXT NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'INR',
  gateway TEXT NOT NULL CHECK (gateway IN ('razorpay', 'stripe')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  gateway_status TEXT,
  gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Performance Indexes

**Critical Indexes for High Traffic:**

```sql
-- Bookings (highest traffic)
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);

-- Payments
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_gateway ON payments(gateway);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- Providers
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_city ON providers(city);
CREATE INDEX idx_providers_is_online ON providers(is_online);
CREATE INDEX idx_providers_rating ON providers(rating DESC);
```

### 3.3 Database Views

**Useful Views for Common Queries:**

```sql
-- View: Pending Providers for Admin
CREATE OR REPLACE VIEW pending_providers AS
SELECT 
  p.id, p.status, p.experience, p.city,
  p.rating, p.created_at,
  u.email, u.phone,
  u.raw_user_meta_data->>'name' as name
FROM providers p
JOIN auth.users u ON p.id = u.id
WHERE p.status = 'pending';

-- View: Provider Earnings Summary
CREATE OR REPLACE VIEW provider_earnings_summary AS
SELECT 
  p.id, p.status, p.rating,
  COUNT(DISTINCT b.id) as total_bookings,
  COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_bookings,
  COALESCE(SUM(pay.amount), 0) as total_earnings
FROM providers p
LEFT JOIN bookings b ON p.id = b.provider_id
LEFT JOIN payments pay ON b.id = pay.booking_id
WHERE p.status = 'approved'
GROUP BY p.id;

-- View: Customer Booking History
CREATE OR REPLACE VIEW customer_booking_history AS
SELECT 
  b.id, b.customer_id, b.status, b.booking_date,
  b.total_amount, b.created_at,
  s.title as service_title,
  s.price as service_price,
  u.email as provider_email,
  u.raw_user_meta_data->>'name' as provider_name,
  p.rating as provider_rating,
  rev.rating as booking_rating,
  pay.status as payment_status
FROM bookings b
LEFT JOIN services s ON b.service_id = s.id
LEFT JOIN providers p ON b.provider_id = p.id
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN reviews rev ON b.id = rev.booking_id
LEFT JOIN payments pay ON b.id = pay.booking_id
WHERE b.status IN ('completed', 'cancelled');
```

---

## 🚀 SECTION 4: DEPLOYMENT STRATEGY

### 4.1 Environments

| Environment | URL                           | Database          | Deployment     |
|------------|------------------------------|-------------------|---------------|
| Development | http://localhost:5173        | Supabase Dev     | Local         |
| Staging    | https://staging.bookyourservice.com | Supabase Staging | Vercel         |
| Production | https://bookyourservice.com     | Supabase Prod    | Vercel         |

### 4.2 Deployment Pipeline

```yaml
# GitHub Actions CI/CD Pipeline

name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Build frontend
        run: cd frontend && npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

### 4.3 Environment Variables

**Required Environment Variables:**

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Payment Gateways
RAZORPAY_KEY_ID=rzp_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Security
NODE_ENV=production
VITE_API_BASE_URL=https://api.bookyourservice.com

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
DATADOG_API_KEY=your_datadog_api_key
```

### 4.4 Deployment Steps

**1. Setup Supabase Project**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Apply database schema
supabase db push

# Deploy Edge Functions
supabase functions deploy
```

**2. Setup Vercel Project**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy frontend
cd frontend
vercel --prod
```

**3. Configure DNS**
- Point domain `bookyourservice.com` to Vercel
- Configure SSL certificates

**4. Monitor Deployment**
- Check logs: `vercel logs`
- Monitor errors: Sentry Dashboard
- Track performance: Datadog Dashboard

---

## 📊 SECTION 5: MONITORING & LOGGING

### 5.1 Error Tracking (Sentry)

**Configuration:**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
```

### 5.2 Performance Monitoring (Datadog)

**Key Metrics to Track:**
- Page Load Time
- API Response Time
- Database Query Time
- Edge Function Execution Time
- Error Rate

### 5.3 Application Logging

**Structured Logging:**
```typescript
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      data
    }));
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || error,
      stack: error?.stack
    }));
  }
};
```

---

## 🔧 SECTION 6: DEVELOPMENT WORKFLOW

### 6.1 Branch Strategy

```
main         → Production
staging      → Staging
dev          → Development
feature/*    → Feature branches
```

### 6.2 Code Review Process

1. Create feature branch from `dev`
2. Make changes and commit
3. Create Pull Request to `dev`
4. Code review by team
5. Merge to `dev`
6. Deploy to staging for testing
7. Test staging environment
8. Create PR from `staging` to `main`
9. Final code review
10. Merge to `main`
11. Automatic deployment to production

### 6.3 Local Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/bookyourservice.git

# Install dependencies
cd frontend
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Start backend (if needed)
cd ../backend
npm run dev
```

---

## 🧪 SECTION 7: TESTING STRATEGY

### 7.1 Unit Testing

**Testing Framework:** Vitest

**Example Test:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { supabase } from '../services/supabase';

describe('BookingService', () => {
  it('should create booking successfully', async () => {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: 'test-customer-id',
        service_id: 'test-service-id',
        status: 'requested',
        booking_date: new Date().toISOString(),
      });

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

### 7.2 Integration Testing

**Testing Database Interactions:**

```typescript
describe('Booking Flow Integration', () => {
  it('should complete full booking flow', async () => {
    // 1. User creates booking
    // 2. Provider accepts booking
    // 3. Customer makes payment
    // 4. Booking marked as completed
    
    // Assert all steps complete successfully
  });
});
```

### 7.3 End-to-End Testing

**Testing Framework:** Playwright

**Example E2E Test:**
```typescript
import { test, expect } from '@playwright/test';

test('customer booking flow', async ({ page }) => {
  await page.goto('https://bookyourservice.com');
  await page.click('text=Login');
  
  // Login
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  
  // Navigate to services
  await page.click('text=Services');
  await page.click('text=Plumbing');
  
  // Book service
  await page.click('text=Book Now');
  
  // Assert booking created
  await expect(page.locator('text=Booking Confirmed')).toBeVisible();
});
```

---

## 📖 SECTION 8: API REFERENCE

### 8.1 REST API Endpoints

#### Authentication
```http
POST /auth/v1/signup          # Create new user
POST /auth/v1/login           # Login user
POST /auth/v1/logout          # Logout user
POST /auth/v1/refresh         # Refresh JWT token
POST /auth/v1/forgot-password # Reset password
```

#### Bookings
```http
GET    /bookings              # Get all bookings (with filters)
GET    /bookings/:id          # Get single booking
POST   /bookings              # Create new booking
PATCH   /bookings/:id          # Update booking
DELETE  /bookings/:id          # Cancel booking
```

#### Payments
```http
POST   /payments/create       # Create payment order (Edge Function)
POST   /payments/webhook      # Payment webhook (Edge Function)
GET    /payments/:id          # Get payment status
```

### 8.2 Realtime Subscriptions

**Supabase Realtime Subscriptions:**

```typescript
// Subscribe to booking updates
const subscription = supabase
  .channel('bookings')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookings',
      filter: 'customer_id=eq.your-user-id'
    },
    (payload) => {
      console.log('Booking change:', payload);
      // Handle real-time update
    }
  )
  .subscribe();
```

---

## 🔍 SECTION 9: TROUBLESHOOTING

### 9.1 Common Issues

**Issue 1: Supabase Connection Failed**
```bash
Solution:
1. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
2. Verify Supabase project is active
3. Check network connectivity
```

**Issue 2: RLS Policy Violation**
```bash
Solution:
1. Check RLS policy definitions
2. Ensure user is authenticated
3. Verify user has correct role
4. Check policy USING/WITH CHECK conditions
```

**Issue 3: Payment Webhook Not Firing**
```bash
Solution:
1. Verify webhook URL in Razorpay/Stripe dashboard
2. Check webhook secret matches environment variable
3. Ensure webhook is accessible (not blocked by firewall)
4. Check webhook logs in Supabase Edge Functions
```

**Issue 4: Realtime Updates Not Working**
```bash
Solution:
1. Ensure realtime is enabled for table
2. Check subscription filter conditions
3. Verify user permissions
4. Check network stability
```

---

## 📞 SECTION 10: SUPPORT & CONTACT

### 10.1 Support Channels

- **Email:** support@bookyourservice.com
- **Phone:** +91-XXXX-XXXXXX
- **Live Chat:** Available on website
- **Documentation:** https://docs.bookyourservice.com

### 10.2 Emergency Contacts

- **Technical Lead:** tech-lead@bookyourservice.com
- **DevOps Engineer:** devops@bookyourservice.com
- **Security Team:** security@bookyourservice.com

---

## 📄 SECTION 11: COMPLIANCE & LEGAL

### 11.1 Data Privacy

- **GDPR Compliant:** Yes
- **Data Storage:** EU Servers
- **Data Retention:** 2 years (configurable)
- **Data Deletion:** User-requested deletion within 30 days

### 11.2 Security Certifications

- **SOC 2 Type II:** In Progress
- **ISO 27001:** Planned Q3 2025
- **PCI DSS:** Compliant (Stripe/Razorpay)

---

## 🎉 CONCLUSION

This documentation covers all aspects of the BookYourService platform:
- ✅ System Architecture
- ✅ Security Model
- ✅ Database Schema
- ✅ Deployment Strategy
- ✅ Monitoring & Logging
- ✅ Development Workflow
- ✅ Testing Strategy
- ✅ API Reference
- ✅ Troubleshooting Guide

**Platform Status:** 🚀 PRODUCTION READY

---

**Document Version:** 2.0.0
**Last Updated:** 2025-04-19
**Maintained By:** BookYourService Engineering Team
