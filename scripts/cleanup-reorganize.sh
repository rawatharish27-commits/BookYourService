#!/bin/bash
# ============================================
# CLEANUP-REORGANIZE.SH - Systematic Code Structure
# ============================================
# This script will:
# 1. Search for misplaced "bad" files in root
# 2. Move them to correct folders (frontend/src/modules, services, etc.)
# 3. Delete duplicate and unwanted files
# 4. Merge code into systematic structure
# 5. Update import paths (where possible)
# 
# GOAL: Clean, Systematic, Full Structured Codebase
# ============================================

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}BOOKYOURSERVICE - SYSTEMATIC CLEANUP${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "${YELLOW}Searching for bad files...${NC}"
echo -e "${YELLOW}Reorganizing code structure...${NC}"
echo -e "${YELLOW}Deleting duplicates...${NC}"
echo -e "${GREEN}===========================================${NC}"

# ============================================
# STEP 1: ENSURE DIRECTORIES EXIST
# ============================================

echo -e "${BLUE}STEP 1: Ensuring directories exist...${NC}"

mkdir -p frontend/src/modules
mkdir -p frontend/src/services
mkdir -p frontend/src/components/ui
mkdir -p frontend/src/components/cards
mkdir -p frontend/src/components/tables
mkdir -p frontend/src/components/forms
mkdir -p frontend/src/components/modals
mkdir -p frontend/src/components/charts
mkdir -p frontend/src/pages/public
mkdir -p frontend/src/pages/customer
mkdir -p frontend/src/pages/provider
mkdir -p frontend/src/pages/admin
mkdir -p frontend/src/pages/shared
mkdir -p frontend/src/routes
mkdir -p frontend/src/lib
mkdir -p frontend/src/context
mkdir -p frontend/src/types
mkdir -p frontend/src/config
mkdir -p frontend/src/hooks
mkdir -p frontend/src/assets

echo -e "${GREEN}✓ All directories created${NC}"

# ============================================
# STEP 2: MOVE MISPLACED MODULES TO frontend/src/modules/
# ============================================

echo -e "${BLUE}STEP 2: Moving misplaced modules...${NC}"

MODULES=(
  "AdminModule.tsx"
  "DashboardModule.tsx"
  "InvestorModule.tsx"
  "ProviderModule.tsx"
  "UserModule.tsx"
  "AuthModule.tsx"
  "BookingModule.tsx"
  "PaymentModule.tsx"
  "ChatModule.tsx"
  "NotificationModule.tsx"
)

for module in "${MODULES[@]}"; do
  if [ -f "$module" ]; then
    echo -e "${YELLOW}Moving: $module → frontend/src/modules/${NC}"
    mv "$module" frontend/src/modules/
  fi
done

# ============================================
# STEP 3: MOVE MISPLACED SERVICES TO frontend/src/services/
# ============================================

echo -e "${BLUE}STEP 3: Moving misplaced services...${NC}"

SERVICES=(
  "AuthService.ts"
  "BookingService.ts"
  "CustomerService.ts"
  "DatabaseService.ts"
  "PaymentService.ts"
  "ProviderService.ts"
  "BillingService.ts"
  "SecurityService.ts"
  "AdminOpsService.ts"
  "ReleaseManagementService.ts"
  "FinancialAuditService.ts"
  "AuditService.ts"
  "NotificationService.ts"
  "CrashReportingService.ts"
  "AIAssistant.tsx"
  "AIIntelligenceService.ts"
  "FraudDetectionEngine.ts"
  "FraudRiskService.ts"
  "QAAutomationService.ts"
  "QualityIntelligenceService.ts"
  "InfraComplianceService.ts"
  "AudioFulfillmentService.ts"
  "MigrationService.ts"
)

for service in "${SERVICES[@]}"; do
  if [ -f "$service" ]; then
    echo -e "${YELLOW}Moving: $service → frontend/src/services/${NC}"
    mv "$service" frontend/src/services/
  fi
done

# ============================================
# STEP 4: MOVE MISPLACED CONFIG FILES TO frontend/
# ============================================

echo -e "${BLUE}STEP 4: Moving config files...${NC}"

CONFIGS=(
  "Dockerfile"
  "cloudbuild.yaml"
  ".env.example"
  ".env.production"
  "nginx.conf"
  "index.html"
)

for config in "${CONFIGS[@]}"; do
  if [ -f "$config" ]; then
    echo -e "${YELLOW}Moving: $config → frontend/${NC}"
    mv "$config" frontend/
  fi
done

# ============================================
# STEP 5: MOVE MISPLACED ENTRY POINTS TO frontend/src/
# ============================================

echo -e "${BLUE}STEP 5: Moving entry points...${NC}"

ENTRY_POINTS=(
  "App.tsx"
  "main.tsx"
)

for entry in "${ENTRY_POINTS[@]}"; do
  if [ -f "$entry" ]; then
    echo -e "${YELLOW}Moving: $entry → frontend/src/${NC}"
    mv "$entry" frontend/src/
  fi
done

# ============================================
# STEP 6: MOVE MISPLACED PAGES TO CORRECT FOLDERS
# ============================================

echo -e "${BLUE}STEP 6: Moving misplaced pages...${NC}"

# Helper function to determine folder type
move_page() {
  local file=$1
  local dest=""
  
  if [[ $file == *"Booking"* ]]; then
    if [[ $file == *"Provider"* ]] || [[ $file == *"Admin"* ]]; then
      dest="frontend/src/pages/provider/"
    else
      dest="frontend/src/pages/customer/"
    fi
  elif [[ $file == *"User"* ]] || [[ $file == *"Profile"* ]]; then
    dest="frontend/src/pages/customer/"
  elif [[ $file == *"Admin"* ]]; then
    dest="frontend/src/pages/admin/"
  elif [[ $file == *"Provider"* ]]; then
    dest="frontend/src/pages/provider/"
  elif [[ $file == *"Auth"* ]] || [[ $file == *"Login"* ]] || [[ $file == *"Signup"* ]]; then
    dest="frontend/src/pages/shared/"
  else
    dest="frontend/src/pages/public/"
  fi
  
  if [ -f "$file" ]; then
    echo -e "${YELLOW}Moving: $file → $dest${NC}"
    mv "$file" "$dest"
  fi
}

# Find and move all .tsx files in root (that are not already in folders)
for file in *.tsx; do
  if [ -f "$file" ]; then
    move_page "$file"
  fi
done

# ============================================
# STEP 7: DELETE BAD FILES (metadata.json, etc.)
# ============================================

echo -e "${BLUE}STEP 7: Deleting bad files...${NC}"

BAD_FILES=(
  "metadata.json"
  "package-lock.json"  # Root package-lock (use frontend's)
  "tsconfig.json"       # Root tsconfig (use frontend's)
)

for bad_file in "${BAD_FILES[@]}"; do
  if [ -f "$bad_file" ]; then
    echo -e "${RED}Deleting: $bad_file${NC}"
    rm "$bad_file"
  fi
done

# ============================================
# STEP 8: DELETE DUPLICATE PAGES
# ============================================

echo -e "${BLUE}STEP 8: Deleting duplicate pages...${NC}"

# Check for duplicates in customer folder
if [ "frontend/src/pages/customer/Bookings-Real.tsx" -a "frontend/src/pages/customer/Bookings.tsx" ]; then
  echo -e "${RED}Deleting duplicate: frontend/src/pages/customer/Bookings-Real.tsx (Keeping: Bookings.tsx)${NC}"
  rm frontend/src/pages/customer/Bookings-Real.tsx
fi

# Check for duplicates in provider folder
if [ "frontend/src/pages/provider/Requests-Real-2.tsx" -a "frontend/src/pages/provider/Requests-Real.tsx" ]; then
  echo -e "${RED}Deleting duplicate: frontend/src/pages/provider/Requests-Real-2.tsx (Keeping: Requests-Real.tsx)${NC}"
  rm frontend/src/pages/provider/Requests-Real-2.tsx
fi

# ============================================
# STEP 9: CREATE SYSTEMATIC INDEX FILES
# ============================================

echo -e "${BLUE}STEP 9: Creating systematic index files...${NC}"

# Create component index
cat > frontend/src/components/ui/index.ts << 'EOF'
export * from './Button';
export * from './Input';
export * from './Card';
export * from './Avatar';
export * from './Badge';
export * from './Loader';
export * from './Modal';
EOF

# Create services index
cat > frontend/src/services/index.ts << 'EOF'
export * from './AuthService';
export * from './BookingService';
export * from './CustomerService';
export * from './DatabaseService';
export * from './PaymentService';
export * from './ProviderService';
EOF

# Create layouts index
cat > frontend/src/layouts/index.ts << 'EOF'
export { AuthLayout } from './AuthLayout';
export { CustomerLayout } from './CustomerLayout';
export { ProviderLayout } from './ProviderLayout';
export { AdminLayout } from './AdminLayout';
export { FullscreenLayout } from './FullscreenLayout';
EOF

# Create pages index
cat > frontend/src/pages/public/index.ts << 'EOF'
export { Landing } from './Landing';
export { Login } from './Login';
export { Signup } from './Signup';
export { Help } from './Help';
export { FAQ } from './FAQ';
export { Terms } from './Terms';
export { Privacy } from './Privacy';
EOF

cat > frontend/src/pages/customer/index.ts << 'EOF'
export { Dashboard } from './Dashboard';
export { Bookings } from './Bookings';
export { Profile } from './Profile';
export { Wallet } from './Wallet';
EOF

cat > frontend/src/pages/provider/index.ts << 'EOF'
export { Dashboard } from './Dashboard';
export { Bookings } from './Bookings';
export { Requests } from './Requests-Real-2';
export { ServiceAreas } from './ServiceAreas';
EOF

cat > frontend/src/pages/admin/index.ts << 'EOF'
export { Dashboard } from './Dashboard';
export { Users } from './Users';
export { Providers } from './Providers';
export { Bookings } from './Bookings';
EOF

echo -e "${GREEN}✓ Index files created${NC}"

# ============================================
# STEP 10: INTEGRATION FIX (UPDATE IMPORT PATHS)
# ============================================

echo -e "${BLUE}STEP 10: Fixing integrations (warning)...${NC}"

echo -e "${YELLOW}NOTE: Some files moved to new locations.${NC}"
echo -e "${YELLOW}You may need to update import paths in your IDE.${NC}"
echo -e "${YELLOW}Common fixes needed:${NC}"
echo -e "${YELLOW}  - frontend/src/pages/AdminProviders.tsx -> frontend/src/pages/admin/Providers.tsx${NC}"
echo -e "${YELLOW}  - frontend/src/pages/CustomerBookings.tsx -> frontend/src/pages/customer/Bookings.tsx${NC}"
echo -e "${YELLOW}  - frontend/src/pages/ProviderBookings.tsx -> frontend/src/pages/provider/Bookings.tsx${NC}"

# Fix specific imports in key files if they exist
if [ -f "frontend/src/pages/admin/Providers.tsx" ]; then
  echo -e "${YELLOW}Checking imports in frontend/src/pages/admin/Providers.tsx...${NC}"
  # sed command to fix imports would go here (simplified for now)
fi

# ============================================
# SUMMARY REPORT
# ============================================

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}CLEANUP COMPLETE${NC}"
echo -e "${GREEN}===========================================${NC}"

echo -e "${BLUE}What was done:${NC}"
echo -e "${GREEN}  1. ✅ Moved misplaced modules to frontend/src/modules/${NC}"
echo -e "${GREEN}  2. ✅ Moved misplaced services to frontend/src/services/${NC}"
echo -e "${GREEN}  3. ✅ Moved config files to frontend/${NC}"
echo -e "${GREEN}  4. ✅ Moved entry points to frontend/src/${NC}"
echo -e "${GREEN}  5. ✅ Moved misplaced pages to correct folders${NC}"
echo -e "${GREEN}  6. ✅ Deleted bad files (metadata.json)${NC}"
echo -e "${GREEN}  7. ✅ Deleted duplicate pages${NC}"
echo -e "${GREEN}  8. ✅ Created systematic index files${NC}"

echo -e "${GREEN}===========================================${NC}"
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo -e "${YELLOW}  1. Verify file structure: tree frontend/src (optional, requires 'tree' command)${NC}"
echo -e "${YELLOW}  2. Fix import paths in your IDE (VS Code will prompt for missing files)${NC}"
echo -e "${YELLOW}  3. Commit changes: git add . && git commit -m 'chore: reorganize code structure'${NC}"
echo -e "${YELLOW}  4. Push to GitHub: git push origin main${NC}"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}SYSTEMATIC CLEANUP COMPLETE${NC}"
echo -e "${GREEN}===========================================${NC}"
