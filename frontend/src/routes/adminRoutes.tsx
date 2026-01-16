/**
 * Admin Routes - Protected admin dashboard routes
 */
import React, { Suspense, lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts';
import ProtectedRoute from './ProtectedRoute';

const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Providers = lazy(() => import('../pages/admin/Providers'));
const Users = lazy(() => import('../pages/admin/Users'));
const Bookings = lazy(() => import('../pages/admin/Bookings'));

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-[#0A2540] rounded-[3rem] flex items-center justify-center text-4xl shadow-3xl animate-pulse mx-auto mb-4">🛠️</div>
    </div>
  </div>
);

const withSuspense = (element: React.ReactNode) => <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;

const adminRoutes = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<Dashboard />) },
      { path: 'providers', element: withSuspense(<Providers />) },
      { path: 'users', element: withSuspense(<Users />) },
      { path: 'bookings', element: withSuspense(<Bookings />) }
    ]
  }
];

export default adminRoutes;

