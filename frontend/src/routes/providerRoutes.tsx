/**
 * Provider Routes - Protected provider dashboard routes
 */
import React, { Suspense, lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ProviderLayout } from '../layouts';
import ProtectedRoute from './ProtectedRoute';

const Dashboard = lazy(() => import('../pages/provider/Dashboard'));
const Bookings = lazy(() => import('../pages/provider/Bookings'));

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-[#0A2540] rounded-[3rem] flex items-center justify-center text-4xl shadow-3xl animate-pulse mx-auto mb-4">🛠️</div>
    </div>
  </div>
);

const withSuspense = (element: React.ReactNode) => <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;

const providerRoutes = [
  {
    path: '/provider',
    element: (
      <ProtectedRoute role="provider">
        <ProviderLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/provider/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<Dashboard />) },
      { path: 'bookings', element: withSuspense(<Bookings />) }
    ]
  }
];

export default providerRoutes;

