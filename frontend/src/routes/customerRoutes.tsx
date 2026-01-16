/**
 * Customer Routes - Protected customer dashboard routes
 */
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../layouts';
import ProtectedRoute from './ProtectedRoute';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/customer/Dashboard'));
const Bookings = lazy(() => import('../pages/customer/Bookings'));

// Loading fallback
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-[#0A2540] rounded-[3rem] flex items-center justify-center text-4xl shadow-3xl animate-pulse mx-auto mb-4">🛠️</div>
    </div>
  </div>
);

const withSuspense = (element: React.ReactNode) => <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;

const customerRoutes = [
  {
    path: '/customer',
    element: (
      <ProtectedRoute role="customer">
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/customer/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<Dashboard />) },
      { path: 'bookings', element: withSuspense(<Bookings />) }
    ]
  }
];

export default customerRoutes;

