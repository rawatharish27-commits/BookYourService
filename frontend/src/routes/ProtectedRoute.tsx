/**
 * ProtectedRoute - Role-based access control for routes
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  role?: 'customer' | 'provider' | 'admin';
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  // For demo purposes - check localStorage
  // Replace with actual auth context in production
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and doesn't match, redirect to appropriate dashboard
  if (role) {
    const userRole = user.role?.toLowerCase();
    if (userRole !== role) {
      // Redirect to appropriate dashboard based on user role
      if (userRole === 'provider') {
        return <Navigate to="/provider/dashboard" replace />;
      } else if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/customer/dashboard" replace />;
      }
    }
  }

  // If children provided, render them, otherwise render Outlet
  return <Outlet />;
};

export default ProtectedRoute;

