# 🚀 GIT FORCE / RESET COMMANDS - QUICK REFERENCE

> **Purpose:** Quick reference for common git force/reset commands
> **Status:** 🟢 READY TO USE
> **Date:** 2025-04-19

---

## ⚠️ WARNING

**BEFORE EXECUTING ANY FORCE/RESET COMMANDS:**

1. **Make a backup:** Always create a backup branch before force/reset
2. **Check git status:** Run `git status` to see current state
3. **Check git log:** Run `git log` to see commit history
4. **Understand command:** Make sure you understand what each command does
5. **Cannot be undone:** Most force/reset commands cannot be undone
6. **Data loss:** Commands like `--hard reset` will permanently delete changes
7. **Push carefully:** Force push (`--force`) will overwrite remote repository

---

## 📋 COMMON SCENARIOS & SOLUTIONS

### **SCENARIO 1: I MADE A MISTAKE IN LAST COMMIT**

**Problem:** You added wrong files or wrote wrong commit message

**Solution:** Amend last commit

```bash
# 1. Check current status
git status

# 2. Make changes (add/remove files)
git add <files>
git reset HEAD <files>

# 3. Amend last commit
git commit --amend

# 4. Force push (required because commit hash changed)
git push --force origin main
```

---

### **SCENARIO 2: I WANT TO UNDO LAST COMMIT BUT KEEP CHANGES**

**Problem:** You want to undo last commit but keep all changes

**Solution:** Soft reset to previous commit

```bash
# 1. Check current status
git status

# 2. Undo last commit (soft reset)
git reset --soft HEAD~1

# 3. Check status (all changes are now staged)
git status

# 4. Create new commit
git commit -m "New commit message"

# 5. Push new commit
git push origin main
```

---

### **SCENARIO 3: I WANT TO RESET TO PREVIOUS COMMIT**

**Problem:** You want to go back to previous commit and lose all changes

**Solution:** Hard reset to previous commit

```bash
# 1. Check current status
git status

# 2. Check commit history
git log --oneline -5

# 3. Hard reset to previous commit (PERMANENT DATA LOSS!)
git reset --hard HEAD~1

# 4. Verify reset
git log --oneline -3

# 5. Force push (required because commit history changed)
git push --force origin main
```

---

### **SCENARIO 4: I WANT TO RESET TO SPECIFIC COMMIT**

**Problem:** You want to go back to specific commit and lose all changes

**Solution:** Hard reset to specific commit

```bash
# 1. Check current status
git status

# 2. Check commit history
git log --oneline -10

# 3. Hard reset to specific commit (PERMANENT DATA LOSS!)
git reset --hard <commit_hash>

# 4. Verify reset
git log --oneline -3

# 5. Force push (required because commit history changed)
git push --force origin main
```

---

### **SCENARIO 5: I WANT TO FORCE PUSH (OVERWRITE REMOTE)**

**Problem:** You have local changes that conflict with remote repository

**Solution:** Force push to remote

```bash
# 1. Check current status
git status

# 2. Check remote status
git status --short --branch

# 3. Force push to origin (WILL OVERWRITE REMOTE!)
git push --force origin main

# 4. Or use force with lease (safer)
git push --force-with-lease origin main
```

---

### **SCENARIO 6: I WANT TO CREATE EMPTY COMMIT**

**Problem:** You want to create a new commit without changing files

**Solution:** Create empty commit

```bash
# 1. Check current status
git status

# 2. Create empty commit
git commit --allow-empty -m "Empty commit message"

# 3. Push to origin
git push origin main
```

---

### **SCENARIO 7: I WANT TO DELETE LAST COMMIT**

**Problem:** You want to permanently delete last commit

**Solution:** Hard reset to previous commit

```bash
# 1. Check current status
git status

# 2. Check commit history
git log --oneline -5

# 3. Delete last commit (PERMANENT DATA LOSS!)
git reset --hard HEAD~1

# 4. Verify deletion
git log --oneline -3

# 5. Force push (required because commit history changed)
git push --force origin main
```

---

### **SCENARIO 8: I WANT TO SQUASH LAST 2 COMMITS**

**Problem:** You have 2 messy commits and want to combine them

**Solution:** Squash last 2 commits

```bash
# 1. Check current status
git status

# 2. Check commit history
git log --oneline -5

# 3. Soft reset to 2 commits ago
git reset --soft HEAD~2

# 4. Check status (all changes from 2 commits are now staged)
git status

# 5. Create new squashed commit
git commit -m "Squashed commit message"

# 6. Force push (required because commit history changed)
git push --force origin main
```

---

### **SCENARIO 9: I WANT TO SQUASH LAST 3 COMMITS**

**Problem:** You have 3 messy commits and want to combine them

**Solution:** Squash last 3 commits

```bash
# 1. Check current status
git status

# 2. Check commit history
git log --oneline -5

# 3. Soft reset to 3 commits ago
git reset --soft HEAD~3

# 4. Check status (all changes from 3 commits are now staged)
git status

# 5. Create new squashed commit
git commit -m "Squashed commit message"

# 6. Force push (required because commit history changed)
git push --force origin main
```

---

## 🚨 EMERGENCY COMMANDS

### **EMERGENCY 1: COMPLETELY RESET TO INITIAL STATE**

**WARNING:** This will delete ALL commits and reset to initial state

**Solution:** Reset to initial commit

```bash
# 1. Check current status
git status

# 2. Check commit history
git log --oneline -10

# 3. Find initial commit hash
git log --reverse --oneline -1

# 4. Hard reset to initial commit (PERMANENT DATA LOSS!)
git reset --hard <initial_commit_hash>

# 5. Verify reset
git log --oneline -3

# 6. Force push (required because commit history changed)
git push --force origin main
```

---

### **EMERGENCY 2: CREATE BACKUP BRANCH BEFORE DANGEROUS OPERATION**

**WARNING:** Always create backup before any dangerous operation

**Solution:** Create backup branch

```bash
# 1. Check current status
git status

# 2. Create backup branch from current state
git branch backup-$(date +%Y%m%d-%H%M%S)

# 3. Switch to backup branch
git checkout backup-$(date +%Y%m%d-%H%M%S)

# 4. Verify backup
git log --oneline -5

# 5. Now you can safely perform dangerous operations on main branch
git checkout main
```

---

### **EMERGENCY 3: RESTORE FROM BACKUP BRANCH**

**Problem:** You made a mistake and want to restore from backup

**Solution:** Restore from backup branch

```bash
# 1. Check available branches
git branch -a

# 2. Switch to backup branch
git checkout backup-<date>

# 3. Verify backup state
git log --oneline -5

# 4. Hard reset main branch to backup state
git checkout main
git reset --hard backup-<date>

# 5. Force push (required because commit history changed)
git push --force origin main
```

---

## 🎯 QUICK REFERENCE COMMANDS

### **AMEND COMMANDS**

| Command | Description | Danger Level |
|---------|-------------|---------------|
| `git commit --amend` | Modify last commit (add/remove files, change message) | Low |
| `git commit --amend --no-edit` | Modify last commit without editing message | Low |

### **RESET COMMANDS**

| Command | Description | Danger Level |
|---------|-------------|---------------|
| `git reset --soft HEAD~1` | Undo last commit but keep changes | Low |
| `git reset --mixed HEAD~1` | Undo last commit and unstage changes | Medium |
| `git reset --hard HEAD~1` | Undo last commit and lose changes (PERMANENT) | High |
| `git reset --hard <commit_hash>` | Reset to specific commit and lose changes (PERMANENT) | High |

### **PUSH COMMANDS**

| Command | Description | Danger Level |
|---------|-------------|---------------|
| `git push origin main` | Normal push (safe) | None |
| `git push --force origin main` | Force push (overwrite remote) | High |
| `git push --force-with-lease origin main` | Force push with lease (safer) | Medium |

### **SQUASH COMMANDS**

| Command | Description | Danger Level |
|---------|-------------|---------------|
| `git reset --soft HEAD~2` | Combine last 2 commits into one | Medium |
| `git reset --soft HEAD~3` | Combine last 3 commits into one | Medium |
| `git rebase -i HEAD~3` | Interactive squash of last 3 commits | High |

---

## 🚨 SAFETY PRECAUTIONS

### **BEFORE ANY FORCE/RESET OPERATION:**

1. **Create Backup Branch:**
   ```bash
   git branch backup-$(date +%Y%m%d-%H%M%S)
   ```

2. **Check Current State:**
   ```bash
   git status
   git log --oneline -5
   ```

3. **Understand Command:**
   - Read command description
   - Check danger level
   - Understand potential data loss

4. **Test Locally:**
   - Verify files are correct
   - Verify changes are correct
   - Verify commit message is correct

### **AFTER FORCE/RESET OPERATION:**

1. **Verify State:**
   ```bash
   git status
   git log --oneline -5
   ```

2. **Verify Files:**
   - Check files are correct
   - Check no data is missing
   - Check no unexpected changes

3. **Test Application:**
   - Run application locally
   - Verify functionality works
   - Verify no errors in logs

---

## 📞 SUPPORT IF NEEDED

### **If you need help with git:**

1. **Check Git Documentation:**
   - https://git-scm.com/docs
   - https://git-scm.com/docs/git-reset
   - https://git-scm.com/docs/git-push

2. **Check Common Issues:**
   - Authentication failed: Check GitHub token
   - Repository not found: Check remote URL
   - Branch not found: Check branch name (main vs master)
   - Push rejected: Force push or resolve conflicts

3. **Use Interactive Mode:**
   - `git rebase -i HEAD~3` (Interactive squash)
   - `git add -p` (Interactive patch)

4. **Contact Support:**
   - GitHub Support: https://support.github.com
   - Git Documentation: https://git-scm.com/docs

---

## 🏁 FINAL STATUS

**Git Status:** 🟢 READY FOR OPERATIONS
**Backup Status:** 🟢 CREATE BACKUP BEFORE DANGEROUS OPERATIONS
**Support:** 🟢 DOCUMENTATION AND TROUBLESHOOTING AVAILABLE

---

## 🚀 QUICK START

### **If you want to amend last commit:**
```bash
git add <files>
git commit --amend
git push --force origin main
```

### **If you want to undo last commit but keep changes:**
```bash
git reset --soft HEAD~1
git status
git commit -m "New commit message"
git push origin main
```

### **If you want to reset to previous commit:**
```bash
git reset --hard HEAD~1
git push --force origin main
```

### **If you want to force push:**
```bash
git push --force origin main
```

---

## 🎯 FINAL WORD

**BEFORE ANY FORCE/RESET OPERATION:**
1. ✅ Create backup branch
2. ✅ Check current state
3. ✅ Understand command
4. ✅ Test locally
5. ✅ Verify after operation

**USE THESE COMMANDS CAREFULLY:**
- Most force/reset commands cannot be undone
- Commands like `--hard reset` will permanently delete changes
- Force push will overwrite remote repository
- Always create backup before dangerous operations

---

## 🚀 EXECUTE NOW!

### **Run Interactive Script:**
```bash
cd /home/z/my-project
./scripts/git-force-reset.sh
```

### **Or Use Commands Directly:**
```bash
# Navigate to project
cd /home/z/my-project

# Check current state
git status
git log --oneline -5

# Choose your command from reference above
git <command>
```

---

## 🏁 FINAL STATUS

**Git Status:** 🟢 READY FOR OPERATIONS
**Backup Status:** 🟢 CREATE BACKUP BEFORE DANGEROUS OPERATIONS
**Support:** 🟢 DOCUMENTATION AND TROUBLESHOOTING AVAILABLE
**Script:** 🟢 INTERACTIVE SCRIPT READY

---

## 🎉 DONE.

**Platform:** BookYourService
**Status:** 🟢 GIT READY FOR OPERATIONS
**Next:** Create backup and execute your git command

---

**🚀 USE THESE COMMANDS CAREFULLY!**

---

## 📞 SUPPORT IF NEEDED

If you need help:
- Check Git Documentation: https://git-scm.com/docs
- Check GitHub Status: https://status.github.com
- Contact GitHub Support: https://support.github.com

---

**DOCUMENT VERSION:** 1.0.0
**LAST UPDATED:** 2025-04-19
