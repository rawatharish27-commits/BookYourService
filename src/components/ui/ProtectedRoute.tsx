import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { UserRole } from '../../types';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAuth = true,
  redirectTo = '/auth/login'
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated but doesn't have required role
  if (isAuthenticated && user && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user role
      const roleRedirects = {
        [UserRole.USER]: '/dashboard',
        [UserRole.PROVIDER]: '/provider/dashboard',
        [UserRole.ADMIN]: '/admin/dashboard',
        [UserRole.ENTERPRISE]: '/enterprise/dashboard',
        [UserRole.PARTNER]: '/partner/dashboard',
      };

      const redirectPath = roleRedirects[user.role] || '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // If authentication is not required and user is authenticated, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    const roleRedirects = {
      [UserRole.USER]: '/dashboard',
      [UserRole.PROVIDER]: '/provider/dashboard',
      [UserRole.ADMIN]: '/admin/dashboard',
      [UserRole.ENTERPRISE]: '/enterprise/dashboard',
      [UserRole.PARTNER]: '/partner/dashboard',
    };

    const redirectPath = roleRedirects[user?.role || UserRole.USER] || '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;