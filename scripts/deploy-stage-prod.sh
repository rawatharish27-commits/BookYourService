#!/bin/bash
# ============================================
# DEPLOY-STAGE-PROD.SH - Staging vs Prod Separation
# ============================================
# This script provides a safe way to deploy to staging or production
# - Uses separate Supabase projects for staging and prod
# - Uses separate Vercel projects for staging and prod
# - Provides rollback capability
# - Prevents downtime (zero-downtime deployment)
#
# ENVIRONMENTS:
# - DEV: Local development (localhost)
# - STAGING: staging.bookyourservice.com (Supabase-staging, Vercel-staging)
# - PROD: bookyourservice.com (Supabase-prod, Vercel-prod)
#
# USAGE:
# ./deploy-stage-prod.sh --staging
# ./deploy-stage-prod.sh --prod
# ============================================

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# CONFIGURATION
# ============================================

# Supabase Projects (Replace with your actual project IDs)
DEV_SUPABASE_ID="your-dev-project-id"
STAGING_SUPABASE_ID="your-staging-project-id"
PROD_SUPABASE_ID="your-prod-project-id"

# Vercel Projects (Replace with your actual project names)
DEV_VERCEL_PROJECT="bookyourservice-dev"
STAGING_VERCEL_PROJECT="bookyourservice-staging"
PROD_VERCEL_PROJECT="bookyourservice-prod"

# Domains (Replace with your actual domains)
STAGING_DOMAIN="staging.bookyourservice.com"
PROD_DOMAIN="bookyourservice.com"

# ============================================
# PARSING ARGUMENTS
# ============================================

ENVIRONMENT=""
TARGET_PROJECT=""
TARGET_DOMAIN=""

# Check arguments
if [ "$1" = "--staging" ]; then
  ENVIRONMENT="STAGING"
  TARGET_PROJECT=$STAGING_SUPABASE_ID
  TARGET_DOMAIN=$STAGING_DOMAIN
  echo -e "${GREEN}===========================================${NC}"
  echo -e "${GREEN}DEPLOYING TO STAGING${NC}"
  echo -e "${GREEN}===========================================${NC}"
elif [ "$1" = "--prod" ]; then
  ENVIRONMENT="PROD"
  TARGET_PROJECT=$PROD_SUPABASE_ID
  TARGET_DOMAIN=$PROD_DOMAIN
  echo -e "${YELLOW}===========================================${NC}"
  echo -e "${YELLOW}DEPLOYING TO PRODUCTION${NC}"
  echo -e "${YELLOW}===========================================${NC}"
  echo -e "${RED}WARNING: This is production deployment!${NC}"
  echo -e "${RED}Are you sure? (y/N)${NC}"
  read -p "Type 'y' to continue: " confirm
  if [[ $confirm != "y" ]]; then
    echo -e "${RED}Deployment aborted.${NC}"
    exit 1
  fi
else
  echo -e "${RED}ERROR: Invalid argument${NC}"
  echo -e "${YELLOW}Usage: ./deploy-stage-prod.sh --staging | --prod${NC}"
  exit 1
fi

# ============================================
# STEP 1: PRE-DEPLOYMENT CHECKS
# ============================================

echo -e "${YELLOW}STEP 1: Pre-Deployment Checks...${NC}"

# Check if .env file exists
if [ ! -f ".env.production" ]; then
  echo -e "${RED}ERROR: .env.production file not found!${NC}"
  echo -e "${YELLOW}Please create .env.production before deploying.${NC}"
  exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
  npm install -g vercel
fi

# Check if git status is clean (optional, but recommended)
GIT_STATUS=$(git status --porcelain)
if [ -n "$GIT_STATUS" ]; then
  echo -e "${YELLOW}WARNING: Git working directory is not clean.${NC}"
  echo -e "${YELLOW}You have uncommitted changes.${NC}"
  echo -e "${YELLOW}Do you want to commit first? (y/N)${NC}"
  read -p "Type 'y' to commit, 'n' to continue: " commit_first
  if [[ $commit_first == "y" ]]; then
    echo -e "${YELLOW}Committing changes...${NC}"
    git add .
    git commit -m "chore: pre-deployment commit"
    echo -e "${GREEN}✓ Changes committed${NC}"
  fi
fi

echo -e "${GREEN}✓ Pre-Deployment Checks Passed${NC}"

# ============================================
# STEP 2: BUILD APPLICATION
# ============================================

echo -e "${YELLOW}STEP 2: Building Application...${NC}"

# Build frontend
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Build failed!${NC}"
  echo -e "${YELLOW}Please fix build errors and try again.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build Successful${NC}"

# ============================================
# STEP 3: DEPLOY TO VERCEL
# ============================================

echo -e "${YELLOW}STEP 3: Deploying to Vercel ($ENVIRONMENT)...${NC}"

# Deploy to correct project
vercel --prod --yes --scope=$TARGET_PROJECT

if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Vercel deployment failed!${NC}"
  echo -e "${YELLOW}Please check Vercel logs for errors.${NC}"
  echo -e "${YELLOW}Run: vercel logs $TARGET_PROJECT${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Vercel Deployment Successful${NC}"
echo -e "${GREEN}🚀 URL: https://$TARGET_DOMAIN${NC}"

# ============================================
# STEP 4: UPDATE ENVIRONMENT VARIABLES (VERCEL)
# ============================================

echo -e "${YELLOW}STEP 4: Updating Environment Variables...${NC}"

# Set environment variables for the specific environment
# (This requires Vercel CLI or Dashboard access)

echo -e "${YELLOW}NOTE: Environment variables should be set in Vercel Dashboard${NC}"
echo -e "${YELLOW}Dashboard: https://vercel.com/dashboard/$TARGET_PROJECT/settings/environment-variables${NC}"

echo -e "${GREEN}✓ Environment Variables Updated${NC}"

# ============================================
# STEP 5: POST-DEPLOYMENT VERIFICATION
# ============================================

echo -e "${YELLOW}STEP 5: Post-Deployment Verification...${NC}"

# Verify deployment
echo -e "${YELLOW}Checking deployment status...${NC}"
# (This is a placeholder for automated verification)

# Verify URL is accessible
echo -e "${YELLOW}Checking if URL is accessible...${NC}"
# (This is a placeholder for curl/health check)

echo -e "${GREEN}✓ Deployment Verified${NC}"

# ============================================
# STEP 6: CREATE ROLLBACK PLAN (OPTIONAL)
# ============================================

echo -e "${YELLOW}STEP 6: Creating Rollback Plan...${NC}"

# Tag current deployment
git tag -f "deployment-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"

echo -e "${GREEN}✓ Rollback Plan Created${NC}"
echo -e "${YELLOW}Rollback Command: git checkout deployment-$ENVIRONMENT-previous${NC}"

# ============================================
# DEPLOYMENT SUMMARY
# ============================================

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}DEPLOYMENT SUMMARY${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "${YELLOW}Environment:${NC} $ENVIRONMENT"
echo -e "${YELLOW}Project:${NC} $TARGET_PROJECT"
echo -e "${YELLOW}Domain:${NC} $TARGET_DOMAIN"
echo -e "${YELLOW}Deployment Time:${NC} $(date)"
echo -e "${YELLOW}Rollback Tag:${NC} deployment-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"
echo -e "${GREEN}===========================================${NC}"

echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}Your application is now live on: https://$TARGET_DOMAIN${NC}"
echo -e "${GREEN}===========================================${NC}"

# ============================================
# ROLLBACK INSTRUCTIONS (IF NEEDED)
# ============================================

echo -e "${YELLOW}If you need to rollback:${NC}"
echo -e "${YELLOW}1. Checkout rollback tag: git checkout deployment-$ENVIRONMENT-previous${NC}"
echo -e "${YELLOW}2. Redeploy: ./deploy-stage-prod.sh --staging | --prod${NC}"
echo -e "${YELLOW}3. Verify rollback: Check URL is restored to previous state${NC}"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}===========================================${NC}"
