#!/bin/bash
# ============================================
# GIT-FORCE-RESET.SH - Force Commit / Reset / Undo
# ============================================
# This script provides options to:
# 1. Force commit (amend last commit)
# 2. Undo last commit (soft reset)
# 3. Reset to previous commit (hard reset)
# 4. Force push (overwrite remote)
# 5. Create empty commit
# 6. Delete last commit
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
echo -e "${GREEN}BOOKYOURSERVICE - GIT FORCE/RESET${NC}"
echo -e "${GREEN}===========================================${NC}"

# ============================================
# SHOW CURRENT GIT STATUS
# ============================================

echo -e "${YELLOW}Current Git Status:${NC}"
git status --short

echo -e "${YELLOW}Recent Commits:${NC}"
git log --oneline -5

echo -e "${YELLOW}Current Branch:${NC}"
git branch --show-current

echo -e "${YELLOW}Remote Repository:${NC}"
git remote -v

# ============================================
# MENU OPTIONS
# ============================================

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}SELECT AN OPTION${NC}"
echo -e "${GREEN}===========================================${NC}"
echo -e "${BLUE}1${NC}) Amend Last Commit (Add/remove files)"
echo -e "${BLUE}2${NC}) Undo Last Commit (Soft reset - keep changes)"
echo -e "${BLUE}3${NC}) Reset to Previous Commit (Hard reset - lose changes)"
echo -e "${BLUE}4${NC}) Reset to Specific Commit (Hard reset - lose changes)"
echo -e "${BLUE}5${NC}) Force Push (Overwrite remote)"
echo -e "${BLUE}6${NC}) Create Empty Commit (Reset without changing files)"
echo -e "${BLUE}7${NC}) Delete Last Commit (Remove last commit permanently)"
echo -e "${BLUE}8${NC})) Squash Last 2 Commits (Combine into single commit)"
echo -e "${BLUE}9${NC})) Squash Last 3 Commits (Combine into single commit)"
echo -e "${BLUE}0${NC})) Exit"
echo -e "${GREEN}===========================================${NC}"

read -p "Enter your choice (0-9): " choice

case $choice in
  1)
    # ============================================
    # OPTION 1: AMEND LAST COMMIT
    # ============================================
    
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${YELLOW}OPTION 1: AMEND LAST COMMIT${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${BLUE}This will amend the last commit with current staged files${NC}"
    echo -e "${BLUE}Use this to add/remove files from the last commit${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    
    echo -e "${YELLOW}Do you want to amend the last commit? (y/N)${NC}"
    read -p "Enter choice: " confirm
    
    if [[ $confirm == "y" || $confirm == "Y" ]]; then
      echo -e "${YELLOW}Amending last commit...${NC}"
      
      # Amend last commit
      git commit --amend --no-edit
      
      echo -e "${GREEN}✓ Last commit amended successfully${NC}"
      echo -e "${YELLOW}To force push, run: ${NC}"
      echo -e "${GREEN}git push --force-with-lease origin main${NC}"
    else
      echo -e "${RED}Amend cancelled${NC}"
    fi
    ;;
    
  2)
    # ============================================
    # OPTION 2: UNDO LAST COMMIT
    # ============================================
    
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${YELLOW}OPTION 2: UNDO LAST COMMIT${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${BLUE}This will undo the last commit but keep all changes${NC}"
    echo -e "${BLUE}Use this to undo a mistake but keep your work${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    
    echo -e "${YELLOW}Do you want to undo the last commit? (y/N)${NC}"
    read -p "Enter choice: " confirm
    
    if [[ $confirm == "y" || $confirm == "Y" ]]; then
      echo -e "${YELLOW}Undoing last commit...${NC}"
      
      # Soft reset to previous commit
      git reset --soft HEAD~1
      
      echo -e "${GREEN}✓ Last commit undone successfully${NC}"
      echo -e "${YELLOW}All changes are now staged${NC}"
      echo -e "${YELLOW}Check git status to see changes${NC}"
      echo -e "${YELLOW}To create new commit, run: ${NC}"
      echo -e "${GREEN}git commit -m 'New message'${NC}"
    else
      echo -e "${RED}Undo cancelled${NC}"
    fi
    ;;
    
  3)
    # ============================================
    # OPTION 3: RESET TO PREVIOUS COMMIT
    # ============================================
    
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${YELLOW}OPTION 3: RESET TO PREVIOUS COMMIT${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${RED}WARNING: This will permanently delete the last commit!${NC}"
    echo -e "${RED}WARNING: All changes in the last commit will be lost!${NC}"
    echo -e "${RED}WARNING: This cannot be undone!${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    
    echo -e "${YELLOW}Do you want to reset to previous commit? (y/N)${NC}"
    read -p "Enter choice: " confirm
    
    if [[ $confirm == "y" || $confirm == "Y" ]]; then
      echo -e "${YELLOW}Resetting to previous commit...${NC}"
      
      # Hard reset to previous commit
      git reset --hard HEAD~1
      
      echo -e "${GREEN}✓ Reset to previous commit successfully${NC}"
      echo -e "${YELLOW}Last commit and all changes are permanently deleted${NC}"
      echo -e "${YELLOW}To force push, run: ${NC}"
      echo -e "${GREEN}git push --force origin main${NC}"
    else
      echo -e "${RED}Reset cancelled${NC}"
    fi
    ;;
    
  4)
    # ============================================
    # OPTION 4: RESET TO SPECIFIC COMMIT
    # ============================================
    
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${YELLOW}OPTION 4: RESET TO SPECIFIC COMMIT${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${RED}WARNING: This will permanently delete all commits after the selected one!${NC}"
    echo -e "${RED}WARNING: All changes in deleted commits will be lost!${NC}"
    echo -e "${RED}WARNING: This cannot be undone!${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    
    echo -e "${YELLOW}Recent commits:${NC}"
    git log --oneline -10
    
    echo -e "${YELLOW}Enter commit hash to reset to:${NC}"
    read -p "Enter commit hash: " commit_hash
    
    if [ -n "$commit_hash" ]; then
      echo -e "${YELLOW}Do you want to reset to commit $commit_hash? (y/N)${NC}"
      read -p "Enter choice: " confirm
      
      if [[ $confirm == "y" || $confirm == "Y" ]]; then
        echo -e "${YELLOW}Resetting to commit $commit_hash...${NC}"
        
        # Hard reset to specific commit
        git reset --hard $commit_hash
        
        echo -e "${GREEN}✓ Reset to commit $commit_hash successfully${NC}"
        echo -e "${YELLOW}All commits after $commit_hash are permanently deleted${NC}"
        echo -e "${YELLOW}To force push, run: ${NC}"
        echo -e "${GREEN}git push --force origin main${NC}"
      else
        echo -e "${RED}Reset cancelled${NC}"
      fi
    else
      echo -e "${RED}Commit hash is required${NC}"
    fi
    ;;
    
  5)
    # ============================================
    # OPTION 5: FORCE PUSH
    # ============================================
    
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${YELLOW}OPTION 5: FORCE PUSH${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${RED}WARNING: This will overwrite the remote repository!${NC}"
    echo -e "${RED}WARNING: Any conflicting changes on remote will be lost!${NC}"
    echo -e "${RED}WARNING: This cannot be undone!${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    
    echo -e "${YELLOW}Do you want to force push to origin? (y/N)${NC}"
    read -p "Enter choice: " confirm
    
    if [[ $confirm == "y" || $confirm == "Y" ]]; then
      echo -e "${YELLOW}Force pushing to origin...${NC}"
      
      # Force push to origin
      git push --force origin main
      
      echo -e "${GREEN}✓ Force push successful${NC}"
      echo -e "${YELLOW}Remote repository overwritten${NC}"
    else
      echo -e "${RED}Force push cancelled${NC}"
    fi
    ;;
    
  6)
    # ============================================
    # OPTION 6: CREATE EMPTY COMMIT
    # ============================================
    
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${YELLOW}OPTION 6: CREATE EMPTY COMMIT${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${BLUE}This will create an empty commit${NC}"
    echo -e "${BLUE}Use this to reset without changing files${NC}"
    echo -e "${BLUE}Use this to create a new branch point${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    
    echo -e "${YELLOW}Enter commit message:${NC}"
    read -p "Enter commit message: " commit_msg
    
    if [ -n "$commit_msg" ]; then
      echo -e "${YELLOW}Creating empty commit...${NC}"
      
      # Create empty commit
      git commit --allow-empty -m "$commit_msg"
      
      echo -e "${GREEN}✓ Empty commit created successfully${NC}"
      echo -e "${YELLOW}To push, run: ${NC}"
      echo -e "${GREEN}git push origin main${NC}"
    else
      echo -e "${RED}Commit message is required${NC}"
    fi
    ;;
    
  7)
    # ============================================
    # OPTION 7: DELETE LAST COMMIT
    # ============================================
    
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${YELLOW}OPTION 7: DELETE LAST COMMIT${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${RED}WARNING: This will permanently delete the last commit!${NC}"
    echo -e "${RED}WARNING: All changes in the last commit will be lost!${NC}"
    echo -e "${RED}WARNING: This cannot be undone!${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    
    echo -e "${YELLOW}Do you want to delete the last commit? (y/N)${NC}"
    read -p "Enter choice: " confirm
    
    if [[ $confirm == "y" || $confirm == "Y" ]]; then
      echo -e "${YELLOW}Deleting last commit...${NC}"
      
      # Delete last commit (hard reset)
      git reset --hard HEAD~1
      
      echo -e "${GREEN}✓ Last commit deleted successfully${NC}"
      echo -e "${YELLOW}Last commit and all changes are permanently deleted${NC}"
      echo -e "${YELLOW}To force push, run: ${NC}"
      echo -e "${GREEN}git push --force origin main${NC}"
    else
      echo -e "${RED}Delete cancelled${NC}"
    fi
    ;;
    
  8)
    # ============================================
    # OPTION 8: SQUASH LAST 2 COMMITS
    # ============================================
    
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${YELLOW}OPTION 8: SQUASH LAST 2 COMMITS${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${BLUE}This will combine the last 2 commits into a single commit${NC}"
    echo -e "${BLUE}Use this to clean up commit history${NC}"
    echo -e "${BLUE}Use this to resolve merge conflicts${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    
    echo -e "${YELLOW}Do you want to squash the last 2 commits? (y/N)${NC}"
    read -p "Enter choice: " confirm
    
    if [[ $confirm == "y" || $confirm == "Y" ]]; then
      echo -e "${YELLOW}Squashing last 2 commits...${NC}"
      
      # Squash last 2 commits (interactive rebase)
      git reset --soft HEAD~2
      
      echo -e "${GREEN}✓ Last 2 commits combined successfully${NC}"
      echo -e "${YELLOW}All changes from the last 2 commits are now staged${NC}"
      echo -e "${YELLOW}Check git status to see changes${NC}"
      echo -e "${YELLOW}To create new commit, run: ${NC}"
      echo -e "${GREEN}git commit -m 'Squashed commit message'${NC}"
      echo -e "${YELLOW}To force push, run: ${NC}"
      echo -e "${GREEN}git push --force origin main${NC}"
    else
      echo -e "${RED}Squash cancelled${NC}"
    fi
    ;;
    
  9)
    # ============================================
    # OPTION 9: SQUASH LAST 3 COMMITS
    # ============================================
    
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${YELLOW}OPTION 9: SQUASH LAST 3 COMMITS${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    echo -e "${BLUE}This will combine the last 3 commits into a single commit${NC}"
    echo -e "${BLUE}Use this to clean up commit history${NC}"
    echo -e "${BLUE}Use this to resolve merge conflicts${NC}"
    echo -e "${YELLOW}===========================================${NC}"
    
    echo -e "${YELLOW}Do you want to squash the last 3 commits? (y/N)${NC}"
    read -p "Enter choice: " confirm
    
    if [[ $confirm == "y" || $confirm == "Y" ]]; then
      echo -e "${YELLOW}Squashing last 3 commits...${NC}"
      
      # Squash last 3 commits (interactive rebase)
      git reset --soft HEAD~3
      
      echo -e "${GREEN}✓ Last 3 commits combined successfully${NC}"
      echo -e "${YELLOW}All changes from the last 3 commits are now staged${NC}"
      echo -e "${YELLOW}Check git status to see changes${NC}"
      echo -e "${YELLOW}To create new commit, run: ${NC}"
      echo -e "${GREEN}git commit -m 'Squashed commit message'${NC}"
      echo -e "${YELLOW}To force push, run: ${NC}"
      echo -e "${GREEN}git push --force origin main${NC}"
    else
      echo -e "${RED}Squash cancelled${NC}"
    fi
    ;;
    
  0)
    # ============================================
    # EXIT
    # ============================================
    
    echo -e "${GREEN}===========================================${NC}"
    echo -e "${GREEN}EXIT${NC}"
    echo -e "${GREEN}===========================================${NC}"
    exit 0
    ;;
    
  *)
    # ============================================
    # INVALID OPTION
    # ============================================
    
    echo -e "${RED}Invalid option. Please enter a number between 0-9.${NC}"
    exit 1
    ;;
esac
