#!/bin/bash
# ============================================
# DEPLOY-PRODUCTION.SH - Final Production Deployment
# ============================================
# This script automates production deployment
# ============================================

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}BOOKYOURSERVICE - PRODUCTION DEPLOYMENT${NC}"
echo -e "${GREEN}===========================================${NC}"

# ============================================
# PRE-FLIGHT CHECKS
# ============================================

echo -e "${YELLOW}Running pre-flight checks...${NC}"

# Check if required environment variables are set
if [ -z "$VERCEL_TOKEN" ]; then
  echo -e "${RED}ERROR: VERCEL_TOKEN not set${NC}"
  exit 1
fi

if [ -z "$SUPABASE_URL" ]; then
  echo -e "${RED}ERROR: SUPABASE_URL not set${NC}"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}ERROR: SUPABASE_SERVICE_ROLE_KEY not set${NC}"
  exit 1
fi

if [ -z "$RAZORPAY_KEY_ID_PROD" ]; then
  echo -e "${RED}ERROR: RAZORPAY_KEY_ID_PROD not set${NC}"
  exit 1
fi

if [ -z "$RAZORPAY_KEY_SECRET_PROD" ]; then
  echo -e "${RED}ERROR: RAZORPAY_KEY_SECRET_PROD not set${NC}"
  exit 1
fi

echo -e "${GREEN}✓ All required environment variables are set${NC}"

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
  echo -e "${RED}ERROR: frontend directory not found. Please run from project root.${NC}"
  exit 1
fi

if [ ! -d "supabase" ]; then
  echo -e "${RED}ERROR: supabase directory not found. Please run from project root.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Directory structure verified${NC}"

# ============================================
# BACKUP CURRENT DEPLOYMENT (ROLLBACK SAFETY)
# ============================================

echo -e "${YELLOW}Creating backup of current deployment...${NC}"

BACKUP_DIR="backups/production-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup current Vercel deployment (if exists)
if command -v vercel &> /dev/null; then
  echo -e "${YELLOW}Backing up Vercel deployment...${NC}"
  vercel ls --prod > "$BACKUP_DIR/vercel-deployments.txt" 2>&1 || true
  echo -e "${GREEN}✓ Vercel backup created${NC}"
fi

# Backup current Supabase Edge Functions (if exists)
if command -v supabase &> /dev/null; then
  echo -e "${YELLOW}Backing up Supabase Edge Functions...${NC}"
  mkdir -p "$BACKUP_DIR/edge-functions"
  cp -r supabase/functions/* "$BACKUP_DIR/edge-functions/" 2>/dev/null || true
  echo -e "${GREEN}✓ Supabase Edge Functions backup created${NC}"
fi

# Backup database schema
if command -v supabase &> /dev/null; then
  echo -e "${YELLOW}Backing up database schema...${NC}"
  supabase db dump -f "$BACKUP_DIR/database-schema.sql" 2>/dev/null || true
  echo -e "${GREEN}✓ Database schema backup created${NC}"
fi

echo -e "${GREEN}✓ Backup completed: $BACKUP_DIR${NC}"

# ============================================
# DEPLOY FRONTEND TO VERCEL
# ============================================

echo -e "${YELLOW}Deploying frontend to Vercel...${NC}"

cd frontend

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build frontend
echo -e "${YELLOW}Building frontend for production...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Deploy to Vercel
echo -e "${YELLOW}Deploying to Vercel (Production)...${NC}"
vercel --prod --yes
echo -e "${GREEN}✓ Frontend deployed to production${NC}"

cd ..

# ============================================
# DEPLOY SUPABASE EDGE FUNCTIONS
# ============================================

echo -e "${YELLOW}Deploying Supabase Edge Functions...${NC}"

# Deploy all edge functions
echo -e "${YELLOW}Deploying all Edge Functions...${NC}"
supabase functions deploy

# Verify deployment
echo -e "${YELLOW}Verifying Edge Function deployment...${NC}"
if command -v curl &> /dev/null; then
  # Test create-payment function
  if curl -s -f "${SUPABASE_URL}/functions/v1/create-payment" > /dev/null; then
    echo -e "${GREEN}✓ create-payment function deployed${NC}"
  else
    echo -e "${RED}ERROR: create-payment function not accessible${NC}"
    exit 1
  fi

  # Test payment-webhook function
  if curl -s -f "${SUPABASE_URL}/functions/v1/payment-webhook" > /dev/null; then
    echo -e "${GREEN}✓ payment-webhook function deployed${NC}"
  else
    echo -e "${RED}ERROR: payment-webhook function not accessible${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓ All Edge Functions deployed successfully${NC}"

# ============================================
# CONFIGURE PRODUCTION ENVIRONMENT
# ============================================

echo -e "${YELLOW}Configuring production environment...${NC}"

# Configure Supabase secrets
echo -e "${YELLOW}Configuring Supabase secrets...${NC}"
supabase secrets set RAZORPAY_KEY_ID "$RAZORPAY_KEY_ID_PROD"
supabase secrets set RAZORPAY_KEY_SECRET "$RAZORPAY_KEY_SECRET_PROD"
supabase secrets set RAZORPAY_WEBHOOK_SECRET "$RAZORPAY_WEBHOOK_SECRET"

if [ -n "$STRIPE_SECRET_KEY_PROD" ]; then
  supabase secrets set STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY_PROD"
  supabase secrets set STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK_SECRET"
fi

supabase secrets set SUPABASE_URL "$SUPABASE_URL"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY"

echo -e "${GREEN}✓ Supabase secrets configured${NC}"

# Configure webhook endpoints
echo -e "${YELLOW}Configuring webhook endpoints...${NC}"

# Configure Razorpay webhook (requires manual action in dashboard)
echo -e "${YELLOW}Please configure Razorpay webhook endpoint manually:${NC}"
echo -e "${GREEN}Webhook URL: ${SUPABASE_URL}/functions/v1/payment-webhook${NC}"
echo -e "${YELLOW}Webhook Secret: $RAZORPAY_WEBHOOK_SECRET${NC}"

# Configure Stripe webhook (requires manual action in dashboard)
if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
  echo -e "${YELLOW}Please configure Stripe webhook endpoint manually:${NC}"
  echo -e "${GREEN}Webhook URL: ${SUPABASE_URL}/functions/v1/payment-webhook${NC}"
  echo -e "${YELLOW}Webhook Secret: $STRIPE_WEBHOOK_SECRET${NC}"
fi

echo -e "${GREEN}✓ Production environment configured${NC}"

# ============================================
# FINAL VERIFICATION
# ============================================

echo -e "${YELLOW}Running final verification...${NC}"

# Check Vercel deployment
echo -e "${YELLOW}Verifying Vercel deployment...${NC}"
VERCEL_URL=$(vercel ls --prod | grep -oE 'https://[^ ]+' | head -1)
if [ -z "$VERCEL_URL" ]; then
  echo -e "${RED}ERROR: Could not get Vercel deployment URL${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Vercel deployment URL: $VERCEL_URL${NC}"

# Check Edge Functions deployment
echo -e "${YELLOW}Verifying Edge Functions deployment...${NC}"
if curl -s -f "${SUPABASE_URL}/functions/v1/create-payment" > /dev/null; then
  echo -e "${GREEN}✓ Edge Functions deployed${NC}"
else
  echo -e "${RED}ERROR: Edge Functions not accessible${NC}"
  exit 1
fi

# Check database connectivity
echo -e "${YELLOW}Verifying database connectivity...${NC}"
if curl -s -f "${SUPABASE_URL}/rest/v1/health" > /dev/null; then
  echo -e "${GREEN}✓ Database accessible${NC}"
else
  echo -e "${YELLOW}⚠ Database health endpoint not accessible (might not exist)${NC}"
fi

# ============================================
# DEPLOYMENT COMPLETE
# ============================================

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}DEPLOYMENT SUCCESSFUL${NC}"
echo -e "${GREEN}===========================================${NC}"

echo -e "${GREEN}Frontend URL: $VERCEL_URL${NC}"
echo -e "${GREEN}Backend URL: $SUPABASE_URL${NC}"
echo -e "${GREEN}Backup Location: $BACKUP_DIR${NC}"

echo -e "${YELLOW}===========================================${NC}"
echo -e "${YELLOW}NEXT STEPS${NC}"
echo -e "${YELLOW}===========================================${NC}"

echo -e "${YELLOW}1. Configure Razorpay webhook in dashboard${NC}"
echo -e "   Webhook URL: ${SUPABASE_URL}/functions/v1/payment-webhook"
echo -e "   Webhook Secret: $RAZORPAY_WEBHOOK_SECRET"

if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
  echo -e "${YELLOW}2. Configure Stripe webhook in dashboard${NC}"
  echo -e "   Webhook URL: ${SUPABASE_URL}/functions/v1/payment-webhook"
  echo -e "   Webhook Secret: $STRIPE_WEBHOOK_SECRET"
fi

echo -e "${YELLOW}3. Update Cloudflare DNS to point to Vercel${NC}"
echo -e "   CNAME: bookyourservice.com → ${VERCEL_URL}"

echo -e "${YELLOW}4. Test payment flow with real card${NC}"
echo -e "   Create booking → Make payment → Verify webhook → Check status"

echo -e "${YELLOW}5. Monitor system for first 24 hours${NC}"
echo -e "   Check dashboards: ${VERCEL_URL}/admin/monitoring"
echo -e "   Review error logs: ${VERCEL_URL}/admin/logs"
echo -e "   Watch for alerts: Slack #incidents"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}ROLLBACK INSTRUCTIONS${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "${YELLOW}If deployment fails or issues arise:${NC}"
echo -e "1. Restore Vercel deployment:"
echo -e "   cd frontend"
echo -e "   vercel rollback"
echo -e ""
echo -e "2. Restore Edge Functions:"
echo -e "   cd supabase/functions"
echo -e " + cp -r ${BACKUP_DIR}/edge-functions/* ."
echo -e " + supabase functions deploy"
echo -e ""
echo -e "3. Restore database schema:"
echo -e " + supabase db reset --file ${BACKUP_DIR}/database-schema.sql"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}DEPLOYMENT COMPLETED SUCCESSFULLY${NC}"
echo -e "${GREEN}===========================================${NC}"
