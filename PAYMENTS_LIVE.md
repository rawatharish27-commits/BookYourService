# 🚀 PAYMENTS_LIVE - FINAL PRODUCTION CHECKLIST & ROLLBACK

> **Purpose:** Ensure payment system is production-ready with proper rollback
> **Status:** ✅ Ready for Production
> **Last Updated:** 2025-04-19

---

## 📋 PRE-PRODUCTION CHECKLIST

### ✅ Razorpay Setup

#### Dashboard Configuration
- [ ] Razorpay account in **LIVE** mode (not test)
- [ ] Production API keys configured in environment
- [ ] Test keys REMOVED from environment
- [ ] Webhook endpoint configured in Razorpay dashboard
- [ ] Webhook secret saved securely
- [ ] Auto-capture enabled for successful payments
- [ ] Refund capabilities tested

#### Webhook Configuration
- [ ] Webhook URL: `https://your-project.supabase.co/functions/v1/payment-webhook`
- [ ] Webhook secret stored in Supabase secrets: `RAZORPAY_WEBHOOK_SECRET`
- [ ] Events configured:
  - `payment.captured`
  - `payment.failed`
  - `refund.processed`
  - `refund.failed`
- [ ] Webhook retries enabled (automatic 3 retries)
- [ ] Webhook timeout: 30 seconds
- [ ] Webhook HMAC verification ENABLED (MANDATORY)

#### Edge Function Configuration
- [ ] `create-payment` Edge Function deployed
- [ ] `payment-webhook` Edge Function deployed
- [ ] Environment variables set:
  - `RAZORPAY_KEY_ID` (production key)
  - `RAZORPAY_KEY_SECRET` (production secret)
  - `RAZORPAY_WEBHOOK_SECRET` (from Razorpay dashboard)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Functions tested with live Razorpay payments

### ✅ Stripe Setup (Alternative)

#### Dashboard Configuration
- [ ] Stripe account in **LIVE** mode (not test)
- [ ] Production API keys configured in environment
- [ ] Test keys REMOVED from environment
- [ ] Webhook endpoint configured in Stripe dashboard
- [ ] Webhook secret saved securely
- [ ] Payment confirmation automatic enabled
- [ ] Refund capabilities tested

#### Webhook Configuration
- [ ] Webhook URL: `https://your-project.supabase.co/functions/v1/payment-webhook`
- [ ] Webhook signing secret stored: `STRIPE_WEBHOOK_SECRET`
- [ ] Events configured:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
- [ ] Webhook signature verification ENABLED (MANDATORY)

---

## 🔄 ROLLBACK PLAN (5-MINUTE)

### Immediate Rollback Triggers

**Rollback immediately if:**
1. Payment success rate drops below 90%
2. More than 5% payments fail
3. Webhook processing errors spike
4. Database update failures exceed 10%
5. Security breach detected

### Rollback Steps (Chronological)

#### T-MINUS-5: Disable Incoming Payments
```bash
# 1. Update environment variable
PAYMENT_MODE=TEST

# 2. Disable Razorpay webhooks
# Go to Razorpay Dashboard → Settings → Webhooks
# Toggle OFF webhook notifications

# 3. Disable Stripe webhooks
# Go to Stripe Dashboard → Developers → Webhooks
# Disable webhook endpoint
```

#### T-MINUS-4: Mark In-Flight Bookings
```sql
-- Update database - mark all pending payments as payment_pending
UPDATE payments
SET status = 'payment_pending'
WHERE status = 'pending';

UPDATE bookings
SET status = 'payment_pending'
WHERE id IN (
  SELECT booking_id
  FROM payments
  WHERE status = 'payment_pending'
);
```

#### T-MINUS-3: Notify Operations Team
```bash
# Send alert to operations channel
# - Webhook disabled
# - In-flight payments marked as pending
# - Manual processing required
```

#### T-MINUS-2: Investigate Root Cause
- Check Edge Function logs
- Check database error logs
- Review webhook failures
- Identify payment gateway issues

#### T-MINUS-1: Communicate Status
- Post status update to stakeholders
- Notify affected users (if needed)
- Create incident ticket

#### T-0: Rollback Complete
- System is now in safe state
- Payments are on hold
- Manual processing can begin

---

## 🧪 PRODUCTION VERIFICATION

### Test Payment Flow

#### Test 1: Small Payment (₹1)
```bash
# 1. Create booking in production
# 2. Initiate ₹1 payment
# 3. Verify payment popup opens
# 4. Complete payment with test card
# 5. Verify webhook received (check Supabase logs)
# 6. Verify booking status = 'completed'
# 7. Verify payment status = 'paid'
# 8. Verify invoice generated
```

**Expected Results:**
- ✅ Payment popup opens
- ✅ Payment completes successfully
- ✅ Webhook fires within 10 seconds
- ✅ Booking status updates to 'completed'
- ✅ Payment status updates to 'paid'
- ✅ Invoice generated automatically

#### Test 2: Failed Payment
```bash
# 1. Create booking
# 2. Initiate payment
# 3. Cancel payment or use declined card
# 4. Verify webhook received
# 5. Verify booking status = 'cancelled'
# 6. Verify payment status = 'failed'
```

**Expected Results:**
- ✅ Payment fails
- ✅ Webhook fires within 10 seconds
- ✅ Booking status updates to 'cancelled'
- ✅ Payment status updates to 'failed'

#### Test 3: Refund
```bash
# 1. Complete successful payment
# 2. Go to admin dashboard
# 3. Process refund for booking
# 4. Verify refund webhook received
# 5. Verify payment status = 'refunded'
# 6. Verify amount refunded
```

**Expected Results:**
- ✅ Refund processed in admin dashboard
- ✅ Refund webhook fires
- ✅ Payment status updates to 'refunded'
- ✅ User receives refund

---

## 🔍 MONITORING CONFIGURATION

### Edge Function Monitoring

```bash
# Monitor these metrics in Supabase Dashboard:
- Function execution time (target: <500ms)
- Error rate (target: <0.1%)
- Invocations per hour
- Cold starts vs warm starts
- Memory usage
- CPU usage
```

### Database Monitoring

```sql
-- Monitor these queries:
-- 1. Payment success rate
SELECT 
  COUNT(*) FILTER (WHERE status = 'paid') AS paid,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  (COUNT(*) FILTER (WHERE status = 'paid')::FLOAT / COUNT(*) * 100)::NUMERIC AS success_rate
FROM payments
WHERE created_at > NOW() - INTERVAL '1 hour';

-- 2. Webhook latency
SELECT 
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) AS avg_latency_seconds,
  MIN(EXTRACT(EPOCH FROM (updated_at - created_at))) AS min_latency_seconds,
  MAX(EXTRACT(EPOCH FROM (updated_at - created_at))) AS max_latency_seconds
FROM payments
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND status IN ('paid', 'failed');

-- 3. Booking sync status
SELECT 
  COUNT(*) FILTER (WHERE status = 'paid') AS paid_payments,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_bookings,
  paid_payments - completed_bookings AS sync_gap
FROM payments
LEFT JOIN bookings ON payments.booking_id = bookings.id
WHERE payments.created_at > NOW() - INTERVAL '1 hour';
```

### Alert Thresholds

```bash
# Critical Alerts (SMS/Phone):
- Payment success rate < 90%
- Webhook errors > 5% in 1 hour
- Booking sync gaps > 10
- Function execution time > 2s
- Function error rate > 1%

# Warning Alerts (Email/Slack):
- Payment failures > 2% in 1 hour
- High latency (>1s for webhook processing)
- Slow function execution (>1s)
- Unusual payment patterns (fraud detection)

# Info Alerts (Slack):
- Large payment transactions (>₹10,000)
- First payment of the day
- Payment volume spike
```

---

## 🚨 INCIDENT RESPONSE PROCEDURES

### Incident Type 1: Payment Gateway Down

**Detection:**
- Razorpay/Stripe API errors spike
- Payment creation fails
- Webhook not responding

**Response:**
```bash
# 1. Immediate (T-0)
# - Check payment gateway status page
# - Verify gateway is not down for maintenance
# - Check social media for outage reports

# 2. If gateway is down:
# - Post maintenance notice on website
# - Disable payment buttons in UI
# - Mark as "Maintenance" in database
# - Notify stakeholders

# 3. If gateway is up but failing:
# - Check API key expiration
# - Verify webhook endpoint is accessible
# - Test payment creation manually
# - Contact payment gateway support

# 4. Resolution:
# - Once gateway is back to normal
# - Test payment flow
# - Enable payment buttons
# - Remove maintenance notice
# - Clear any stuck payments
```

### Incident Type 2: Webhook Not Firing

**Detection:**
- Payments complete but bookings don't update
- Webhook not appearing in logs
- Status stuck at 'pending'

**Response:**
```bash
# 1. Verify webhook endpoint is accessible
# - Check Cloudflare/CDN settings
# - Test webhook URL manually
# - Verify Supabase Edge Function is running

# 2. Check webhook configuration
# - Verify webhook secret is correct
# - Verify webhook events are enabled
# - Check webhook is active (not disabled)

# 3. Test webhook manually
# - Use Razorpay/Stripe webhook test tool
# - Send test webhook to endpoint
# - Check Supabase logs for webhook receipt

# 4. Manually process stuck payments
# - Query payments with status 'pending' but completed_at > 15 min
# - Manually update booking status
# - Manually update payment status
# - Send confirmation to customers

# 5. Prevention
# - Set up webhook monitoring
# - Implement webhook retry logic
# - Add webhook health check endpoint
```

### Incident Type 3: Security Breach

**Detection:**
- Unauthorized payment attempts
- Webhook signature verification fails
- Payment amount tampering
- Unusual payment patterns

**Response:**
```bash
# 1. Immediate (T-0)
# - Disable all payment processing
# - Set PAYMENT_MODE=TEST
# - Rotate all API keys
# - Lock down system

# 2. Investigation
# - Review audit logs
# - Check for unauthorized access
# - Verify webhook signature verification
# - Check for SQL injection attempts
# - Check for IDOR vulnerabilities

# 3. Recovery
# - Patch security vulnerabilities
# - Update dependencies
# - Implement additional security checks
# - Perform full security audit
# - Update incident response procedures

# 4. Communication
# - Notify affected customers
# - Notify stakeholders
# - Create public incident report
# - Document lessons learned
```

---

## 📊 POST-LAUNCH MONITORING PLAN

### Day 1 (Critical)
- Monitor payment success rate (target: >95%)
- Monitor webhook latency (target: <500ms)
- Monitor error rates (target: <1%)
- Check all alerts every hour
- Review logs every 2 hours

### Week 1 (High)
- Daily payment success report
- Weekly error analysis
- Performance optimization
- User feedback collection
- Bug fixes and improvements

### Month 1 (Medium)
- Monthly payment volume report
- Revenue reconciliation
- Gateway performance analysis
- Cost optimization
- Feature planning

---

## 🎯 SUCCESS METRICS

### Technical Metrics
- Payment success rate: >98%
- Webhook processing time: <500ms (P95)
- Function execution time: <300ms (P95)
- Error rate: <0.5%
- Uptime: >99.9%

### Business Metrics
- Daily payment volume: Target ₹100,000+
- Monthly payment volume: Target ₹3,000,000+
- Customer payment success: >95%
- Provider payout accuracy: >99%
- Refund rate: <2%

### User Experience Metrics
- Payment completion time: <2 minutes
- Payment success feedback: >4.5/5
- Payment failure rate: <5%
- Support tickets related to payments: <1%

---

## 📞 EMERGENCY CONTACTS

**Payment Gateway Support:**
- Razorpay Support: support@razorpay.com
- Stripe Support: support@stripe.com

**Technical Team:**
- CTO: cto@bookyourservice.com
- Lead Developer: lead-dev@bookyourservice.com
- DevOps Engineer: devops@bookyourservice.com

**Management:**
- CEO: ceo@bookyourservice.com
- Product Manager: product@bookyourservice.com

---

## ✅ FINAL LAUNCH VERIFICATION

Before going live, verify:

- [ ] All test payments passed
- [ ] Webhook verified with real payments
- [ ] Rollback plan tested and documented
- [ ] Monitoring configured and tested
- [ ] Alerts configured and tested
- [ ] Incident response procedures documented
- [ ] Emergency contacts verified
- [ ] Team trained on procedures
- [ ] Stakeholders notified of launch

---

**LAUNCH STATUS:** ✅ PRODUCTION READY

**Next:** Launch payments live and monitor closely for first 24 hours.

**Document Version:** 2.0.0
**Last Updated:** 2025-04-19
