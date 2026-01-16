#!/bin/bash
# ============================================
# MERGE-ALL-BRANCHES.SH - Seed, Safe, Practical
# ============================================
# This script safely merges all feature branches into main
# - No destructive operations (no hard reset)
# - Preserves commit history
# - Stops on conflicts for manual resolution
# - Pushes clean main branch to GitHub
# 
# PREREQUISITE:
# - You must be on 'main' branch
# - These branches must exist: feature-auth, feature-admin, feature-booking, feature-payment
# - If branches have different names, you'll be prompted to enter them
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
echo -e "${GREEN}BOOKYOURSERVICE - MERGE ALL BRANCHES${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "${YELLOW}GOAL: Merge 4 feature branches into main safely${NC}"
echo -e "${YELLOW}===========================================${NC}"

# ============================================
# STEP 1: CHECK CURRENT BRANCH
# ============================================

echo -e "${YELLOW}STEP 1: Checking current branch...${NC}"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}Current branch:${NC} $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${RED}ERROR: You are not on 'main' branch!${NC}"
  echo -e "${YELLOW}Switching to main...${NC}"
  git checkout main
  if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to checkout main${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Switched to main${NC}"
else
  echo -e "${GREEN}✓ Already on main${NC}"
fi

# ============================================
# STEP 2: FETCH LATEST FROM REMOTE
# ============================================

echo -e "${YELLOW}STEP 2: Fetching latest changes from remote...${NC}"
git fetch origin main
echo -e "${GREEN}✓ Fetched latest changes${NC}"

# ============================================
# STEP 3: CHECK IF FEATURE BRANCHES EXIST
# ============================================

echo -e "${YELLOW}STEP 3: Checking for feature branches...${NC}"

FEATURE_BRANCHES=(
  "feature-auth"
  "feature-admin"
  "feature-booking"
  "feature-payment"
)

EXISTING_BRANCHES=()
MISSING_BRANCHES=()

for branch in "${FEATURE_BRANCHES[@]}"; do
  if git show-ref --verify --quiet refs/heads/"$branch"; then
    echo -e "${GREEN}✓ Found branch:${NC} $branch"
    EXISTING_BRANCHES+=("$branch")
  else
    echo -e "${YELLOW}✗ Missing branch:${NC} $branch"
    MISSING_BRANCHES+=("$branch")
  fi
done

# If all branches are missing, user might have different branch names
if [ ${#EXISTING_BRANCHES[@]} -eq 0 ]; then
  echo -e "${RED}ERROR: No feature branches found!${NC}"
  echo -e "${YELLOW}Your branches might have different names.${NC}"
  echo -e "${YELLOW}Available branches:${NC}"
  git branch -a
  echo -e "${YELLOW}Do you want to merge specific branches? (y/N)${NC}"
  read -p "Enter choice: " answer
  
  if [[ $answer == "y" || $answer == "Y" ]]; then
    echo -e "${YELLOW}Enter branch names to merge (space-separated):${NC}"
    read -p "Branches: " user_branches
    EXISTING_BRANCHES=($user_branches)
  else
    echo -e "${RED}Cannot proceed without feature branches${NC}"
    exit 1
  fi
fi

# ============================================
# STEP 4: MERGE EACH BRANCH SEQUENTIALLY
# ============================================

echo -e "${YELLOW}STEP 4: Merging branches sequentially...${NC}"
echo -e "${YELLOW}===========================================${NC}"

MERGE_SUCCESS=0
MERGE_FAILED=0

for branch in "${EXISTING_BRANCHES[@]}"; do
  echo -e "${BLUE}-------------------------------------------${NC}"
  echo -e "${YELLOW}Merging branch:${NC} $branch"
  echo -e "${BLUE}-------------------------------------------${NC}"
  
  # Attempt to merge
  git merge "$branch"
  
  # Check merge status
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully merged:${NC} $branch"
    MERGE_SUCCESS=$((MERGE_SUCCESS + 1))
  else
    echo -e "${RED}✗ Failed to merge:${NC} $branch"
    echo -e "${YELLOW}This is likely due to merge conflicts.${NC}"
    echo -e "${YELLOW}Conflicting files:${NC}"
    git status --short
    
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${YELLOW}INSTRUCTIONS TO RESOLVE CONFLICTS:${NC}"
    echo -e "${YELLOW}1. Open conflicting files in VS Code${NC}"
    echo -e "${YELLOW}2. Look for <<<<<<<, ======>, >>>>>>> markers${NC}"
    echo -e "${YELLOW}3. Choose which changes to keep${NC}"
    echo -e "${YELLOW}4. Save files${NC}"
    echo -e "${YELLOW}5. Run: git add .${NC}"
    echo -e "${YELLOW}6. Run: git commit${NC}"
    echo -e "${YELLOW}7. Run this script again: ./scripts/merge-all-branches.sh${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    
    echo -e "${RED}Script stopped due to merge conflicts.${NC}"
    echo -e "${YELLOW}Please resolve conflicts before continuing.${NC}"
    exit 1
  fi
done

# ============================================
# STEP 5: PUSH TO GITHUB
# ============================================

echo -e "${YELLOW}STEP 5: Pushing merged main branch to GitHub...${NC}"

echo -e "${BLUE}Latest commits:${NC}"
git log --oneline -5

echo -e "${YELLOW}Do you want to push to GitHub? (y/N)${NC}"
read -p "Enter choice: " push_answer

if [[ $push_answer == "y" || $push_answer == "Y" ]]; then
  echo -e "${YELLOW}Pushing to GitHub...${NC}"
  git push origin main
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}===========================================${NC}"
    echo -e "${GREEN}PUSH SUCCESSFUL!${NC}"
    echo -e "${GREEN}===========================================${NC}"
    echo -e "${GREEN}Repository: https://github.com/rawatharish27-commits/BookYourService${NC}"
    echo -e "${GREEN}Branch: main${NC}"
    echo -e "${GREEN}Branches merged:${NC}"
    for branch in "${EXISTING_BRANCHES[@]}"; do
      echo -e "${GREEN}  - $branch${NC}"
    done
    echo -e "${GREEN}===========================================${NC}"
  else
    echo -e "${RED}===========================================${NC}"
    echo -e "${RED}PUSH FAILED!${NC}"
    echo -e "${RED}===========================================${NC}"
    echo -e "${YELLOW}Check your GitHub token${NC}"
    echo -e "${YELLOW}Check your internet connection${NC}"
    echo -e "${YELLOW}Try manual push: git push origin main${NC}"
    echo -e "${GREEN}===========================================${NC}"
  fi
else
  echo -e "${YELLOW}Push skipped. You can push manually later:${NC}"
  echo -e "${GREEN}git push origin main${NC}"
fi

# ============================================
# FINAL SUMMARY
# ============================================

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}MERGE SUMMARY${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}Successfully merged:${NC} $MERGE_SUCCESS branches"
echo -e "${GREEN}Branches merged:${NC}"
for branch in "${EXISTING_BRANCHES[@]}"; do
  echo -e "${GREEN}  - $branch${NC}"
done

echo -e "${YELLOW}===========================================${NC}"
echo -e "${YELLOW}WHAT THIS SCRIPT DID:${NC}"
echo -e "${YELLOW}1. Switched to main branch${NC}"
echo -e "${YELLOW}2. Fetched latest changes from remote${NC}"
echo -e "${YELLOW}3. Checked for feature branches${NC}"
echo -e "${YELLOW}4. Merged all branches sequentially (no tod-fod)${NC}"
echo -e "${YELLOW}5. Attempted to push to GitHub${NC}"
echo -e "${YELLOW}===========================================${NC}"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}DONE - All code is now in main branch${NC}"
echo -e "${GREEN}===========================================${NC}"
