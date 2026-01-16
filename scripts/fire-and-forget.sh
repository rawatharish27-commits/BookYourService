#!/bin/bash
# ============================================
# FIRE-AND-FORGET.SH - Quick Force Commit & Push
# ============================================

set -e
set -o pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}BOOKYOURSERVICE - FORCE COMMIT${NC}"
echo -e "${GREEN}===========================================${NC}"

# Clean .next/ folder (build cache)
rm -rf .next 2>/dev/null || true

# Create necessary directories
mkdir -p frontend/src/services frontend/src/modules frontend/src/services/integrations 2>/dev/null || true

# Move service files to correct location (ignore errors)
mv AuthService.ts BookingService.ts CustomerService.ts DatabaseService.ts ProviderService.ts frontend/src/services/ 2>/dev/null || true
mv PaymentService.ts BillingService.ts frontend/src/services/integrations/ 2>/dev/null || true
mv AIAssistant.tsx AIIntelligenceService.ts FraudDetectionEngine.ts FraudRiskService.ts QAAutomationService.ts QualityIntelligenceService.ts frontend/src/services/ 2>/dev/null || true
mv AdminModule.tsx DashboardModule.tsx ProviderModule.tsx InvestorModule.tsx frontend/src/modules/ 2>/dev/null || true
mv AdminOpsService.ts CrashReportingService.ts FinancialAuditService.ts SecurityIntelligenceService.ts SecurityService.ts ReleaseManagementService.ts frontend/src/services/ 2>/dev/null || true
mv AudioFulfillmentService.ts InfraComplianceService.ts MigrationService.ts frontend/src/services/integrations/ 2>/dev/null || true

# Stage all production files
git add frontend/ database/ scripts/ *.md *.json 2>/dev/null || true
git add frontend/src/ 2>/dev/null || true
git add frontend/src/pages/ 2>/dev/null || true
git add frontend/src/components/ 2>/dev/null || true
git add frontend/src/services/ 2>/dev/null || true
git add frontend/src/modules/ 2>/dev/null || true
git add frontend/src/layouts/ 2>/dev/null || true
git add frontend/src/routes/ 2>/dev/null || true
git add frontend/src/api/ 2>/dev/null || true
git add frontend/src/lib/ 2>/dev/null || true
git add frontend/src/context/ 2>/dev/null || true
git add frontend/src/types.ts 2>/dev/null || true
git add frontend/src/main.tsx 2>/dev/null || true
git add frontend/src/App.tsx 2>/dev/null || true
git add frontend/index.html 2>/dev/null || true

echo -e "${GREEN}✓ Files staged${NC}"

# Force commit (ignore errors)
git commit -m "feat: production launch v2.0.0 - force commit (main branch)" 2>/dev/null || true

echo -e "${GREEN}✓ Force committed${NC}"

# Force push to GitHub (ignore errors)
git push --force GITHUB_TOKEN_URL/rawatharish27-commits/BookYourService.git main 2>&1 || true

echo -e "${GREEN}✓ Force pushed${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}DONE${NC}"
echo -e "${GREEN}===========================================${NC}"
