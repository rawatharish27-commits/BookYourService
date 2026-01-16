#!/bin/bash
# ============================================
# FIX-IMPORTS.SH - Fix Build Errors After Clean
# ============================================
# This script fixes common import path errors caused by file moves
# - Fixes imports in App.tsx
# - Fixes imports in main.tsx
# - Fixes imports in pages
# 
# PROBLEM: Files were moved (e.g., AuthService.ts -> services/AuthService.ts)
#          But imports in code were not updated.
# SOLUTION: Use `sed` to batch fix import paths.
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
echo -e "${GREEN}BOOKYOURSERVICE - FIX IMPORT PATHS${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "${YELLOW}Fixing imports after cleanup...${NC}"
echo -e "${YELLOW}===========================================${NC}"

# ============================================
# FIX 1: APP.TSX
# ============================================

echo -e "${BLUE}FIX 1: frontend/src/App.tsx${NC}"

if [ -f "frontend/src/App.tsx" ]; then
  echo -e "${YELLOW}Fixing imports in App.tsx...${NC}"
  
  # Fix AuthService import
  sed -i "s|from './AuthService'|from './services/AuthService'|g" frontend/src/App.tsx
  
  # Fix DatabaseService import
  sed -i "s|from './DatabaseService'|from './services/DatabaseService'|g" frontend/src/App.tsx
  
  # Fix BookingService import
  sed -i "s|from './BookingService'|from './services/BookingService'|g" frontend/src/App.tsx
  
  # Fix SecurityService import
  sed -i "s|from './SecurityService'|from './services/SecurityService'|g" frontend/src/App.tsx
  
  echo -e "${GREEN}✓ App.tsx imports fixed${NC}"
else
  echo -e "${RED}ERROR: frontend/src/App.tsx not found!${NC}"
fi

# ============================================
# FIX 2: MAIN.TSX
# ============================================

echo -e "${BLUE}FIX 2: frontend/src/main.tsx${NC}"

if [ -f "frontend/src/main.tsx" ]; then
  echo -e "${YELLOW}Fixing imports in main.tsx...${NC}"
  
  # Fix imports
  sed -i "s|from './AuthService'|from './services/AuthService'|g" frontend/src/main.tsx
  sed -i "s|from './DatabaseService'|from './services/DatabaseService'|g" frontend/src/main.tsx
  sed -i "s|from './BookingService'|from './services/BookingService'|g" frontend/src/main.tsx
  
  echo -e "${GREEN}✓ main.tsx imports fixed${NC}"
else
  echo -e "${RED}ERROR: frontend/src/main.tsx not found!${NC}"
fi

# ============================================
# FIX 3: PAGES (BATCH)
# ============================================

echo -e "${BLUE}FIX 3: frontend/src/pages/**/*.tsx${NC}"

# Find all .tsx files in pages folder
# Fix imports recursively
find frontend/src/pages -name "*.tsx" -type f | while read file; do
  echo -e "${YELLOW}Fixing imports in $file...${NC}"
  
  # Fix service imports
  sed -i "s|from '../AuthService'|from '../services/AuthService'|g" "$file"
  sed -i "s|from '../BookingService'|from '../services/BookingService'|g" "$file"
  sed -i "s|from '../DatabaseService'|from '../services/DatabaseService'|g" "$file"
  sed -i "s|from '../SecurityService'|from '../services/SecurityService'|g" "$file"
  sed -i "s|from '../PaymentService'|from '../services/PaymentService'|g" "$file"
  
done

echo -e "${GREEN}✓ All page imports fixed${NC}"

# ============================================
# FIX 4: MODULES (BATCH)
# ============================================

echo -e "${BLUE}FIX 4: frontend/src/modules/**/*.tsx${NC}"

find frontend/src/modules -name "*.tsx" -type f | while read file; do
  echo -e "${YELLOW}Fixing imports in $file...${NC}"
  
  # Fix service imports
  sed -i "s|from '../services/AuthService'|from '../services/AuthService'|g" "$file"
  sed -i "s|from '../services/BookingService'|from '../services/BookingService'|g" "$file"
  
done

echo -e "${GREEN}✓ All module imports fixed${NC}"

# ============================================
# SUMMARY REPORT
# ============================================

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}IMPORTS FIXED${NC}"
echo -e "${GREEN}===========================================${NC}"

echo -e "${BLUE}What was fixed:${NC}"
echo -e "${GREEN}  1. ✅ App.tsx imports${NC}"
echo -e "${GREEN}  2. ✅ main.tsx imports${NC}"
echo -e "${GREEN}  3. ✅ All page imports${NC}"
echo -e "${GREEN}  4. ✅ All module imports${NC}"

echo -e "${GREEN}===========================================${NC}"
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo -e "${YELLOW}  1. Try building again: cd frontend && npm run build${NC}"
echo -e "${YELLOW}  2. If still fails, check for more import errors${NC}"
echo -e "${YELLOW}  3. Commit fixes: git add frontend/src && git commit -m 'chore: fix import paths after cleanup'${NC}"
echo -e "${YELLOW}  4. Push changes: git push origin main${NC}"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}IMPORT FIX COMPLETE${NC}"
echo -e "${GREEN}===========================================${NC}"
