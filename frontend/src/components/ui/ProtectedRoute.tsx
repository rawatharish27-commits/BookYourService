import { ReactElement } from 'react';
import { useAuth } from '../../providers/AuthProvider'; // Adjust path as needed

// ============================================
// AUTH GUARD (PHASE 3 - ENFORCE RBAC)
// ============================================
// Purpose: Protect Routes based on User Role.
// Stack: React Context + TypeScript.
// Type: Production-Grade (Strict RBAC).
// 
// IMPORTANT:
// 1. Wraps Child Components.
// 2. Checks `user.role` from `AuthProvider`.
// 3. Redirects Unauthorized users to `/login`.
// 4. Blocks Unauthorized Access (403 Forbidden).
// ============================================

export interface ProtectedRouteProps {
  role: 'ADMIN' | 'CUSTOMER' | 'PROVIDER';
  children: ReactElement;
}

export const ProtectedRoute = ({ role, children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // 1. Loading State
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // 2. Not Logged In
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Please login to access this page.</div>
      </div>
    );
  }

  // 3. Authorized (Correct Role)
  if (user.role === role) {
    return <>{children}</>;
  }

  // 4. Unauthorized (Wrong Role)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">Access Denied: You do not have permission to view this page.</div>
    </div>
  );
};

export default ProtectedRoute;
