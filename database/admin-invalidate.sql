-- ============================================
-- ADMIN-INVALIDATE.SQL - Block All Demo Admins
-- ============================================
-- This script forcefully blocks all admin accounts
-- that were created during development/demo phase.
-- 
-- SECURITY NOTE:
-- This is a one-time script to invalidate admin access.
-- Run this in Supabase SQL Editor (production mode only).
-- ============================================

-- BLOCKING STRATEGY:
-- Option 1: Change status to 'suspended' (prevents login)
-- Option 2: Change email to 'invalid-admin@bookyourservice.com' (prevents login)
-- Option 3: Change password reset flag (forces password reset)

-- ============================================================
-- LIST OF DEMO ADMIN EMAILS TO INVALIDATE
-- (Update this list with your actual demo admin emails)
-- ============================================================

WITH demo_admins AS (
  SELECT 
    p.id as provider_id,
    u.id as user_id,
    u.email as email
  FROM providers p
  LEFT JOIN auth.users u ON p.id = u.id
  LEFT JOIN profiles pr ON p.id = pr.id
  WHERE pr.role = 'admin'
    AND (
      u.email IN (
        'admin@bookyourservice.com',  -- Add your demo admin emails here
        'demo@bookyourservice.com',
        'test@bookyourservice.com',
        'dev@bookyourservice.com'
      ) OR
      u.email LIKE '%@example.com'     -- Block all example.com emails (for demo)
    )
)

-- ============================================================
-- OPTION 1: SUSPEND ALL DEMO ADMINS
-- This changes status to 'suspended' which our RLS policies
-- check before allowing login.
-- ============================================================

UPDATE profiles pr
SET status = 'suspended'
WHERE id IN (
  SELECT pr.id
  FROM auth.users u
  LEFT JOIN providers p ON u.id = p.id
  LEFT JOIN profiles pr ON p.id = pr.id
  WHERE pr.role = 'admin'
    AND (
      u.email IN (
        'admin@bookyourservice.com',
        'demo@bookyourservice.com',
        'test@bookyourservice.com',
        'dev@bookyourservice.com'
      ) OR
      u.email LIKE '%@example.com'
    )
);

-- ============================================================
-- OPTION 2: INVALIDATE EMAIL ADDRESSES
-- This appends .invalid to the email, making it unusable.
-- NOTE: This requires Supabase Auth Management (cannot do via SQL alone).
-- 
-- For now, we will log this to audit_logs table.
-- ============================================================

INSERT INTO audit_logs (
  actor_id,
  action,
  entity,
  entity_id,
  metadata,
  ip_address,
  user_agent,
  created_at
)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'system@bookyourservice.com' LIMIT 1),
  'ADMIN_INVALIDATION',
  'users',
  u.id,
  jsonb_build_object(
    'original_email', u.email,
    'action', 'suspended',
    'reason', 'Demo admin account invalidated',
    'timestamp', NOW()
  ),
  '127.0.0.1',
  'Admin Invalidation Script',
  NOW()
FROM auth.users u
WHERE u.email IN (
  'admin@bookyourservice.com',
  'demo@bookyourservice.com',
  'test@bookyourservice.com',
  'dev@bookyourservice.com'
)
OR u.email LIKE '%@example.com';

-- ============================================================
-- OPTION 3: FLAG ACCOUNTS FOR REVIEW
-- This adds a custom flag to audit_logs for manual review.
-- ============================================================

INSERT INTO audit_logs (
  actor_id,
  action,
  entity,
  entity_id,
  metadata,
  ip_address,
  user_agent,
  created_at
)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'system@bookyourservice.com' LIMIT 1),
  'ADMIN_REVIEW',
  'users',
  u.id,
  jsonb_build_object(
    'email', u.email,
    'status', 'requires_manual_review',
    'reason', 'Demo admin account flagged for manual review',
    'action_required', 'Manual verification needed before allowing access',
    'timestamp', NOW()
  ),
  '127.0.0.1',
  'Admin Invalidation Script',
  NOW()
FROM auth.users u
WHERE u.email IN (
  'admin@bookyourservice.com',
  'demo@bookyourservice.com',
  'test@bookyourservice.com',
  'dev@bookyourservice.com'
)
OR u.email LIKE '%@example.com';

-- ============================================================
-- MANUAL VERIFICATION REQUIREMENT
-- 
-- After running this script, ALL demo admin accounts will be suspended.
-- To reactivate any legitimate admin account, run the following command:
-- 
-- UPDATE profiles SET status = 'approved' 
-- WHERE id = 'YOUR_LEGITIMATE_ADMIN_ID';
-- 
-- AND UPDATE the auth.users email if needed (via Supabase Dashboard).
-- ============================================================

-- ============================================================
-- COMPLETION NOTIFICATION
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'Demo admin accounts invalidated successfully!';
  RAISE NOTICE 'All demo admin accounts have been suspended.';
  RAISE NOTICE 'Manual verification is required before allowing access.';
  RAISE NOTICE 'Check audit_logs table for invalidated accounts.';
END
$$;
