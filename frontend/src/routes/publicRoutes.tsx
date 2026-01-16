/**
 * Public Routes - Landing, legal, help pages (15+ routes)
 * No authentication required
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts';

// Lazy load pages for better performance
const Landing = lazy(() => import('../pages/public/Landing'));
const Login = lazy(() => import('../pages/public/Login'));
const Signup = lazy(() => import('../pages/public/Signup'));
const ForgotPassword = lazy(() => import('../pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/public/ResetPassword'));
const VerifyEmail = lazy(() => import('../pages/public/VerifyEmail'));
const Help = lazy(() => import('../pages/public/Help'));
const FAQ = lazy(() => import('../pages/public/FAQ'));
const Terms = lazy(() => import('../pages/public/Terms'));
const Privacy = lazy(() => import('../pages/public/Privacy'));
const Maintenance = lazy(() => import('../pages/public/Maintenance'));
const NotFound = lazy(() => import('../pages/public/NotFound'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-[#0A2540] flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-white rounded-[3rem] flex items-center justify-center text-4xl shadow-3xl animate-pulse mx-auto mb-4">
        🛠️
      </div>
      <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-loading-bar"></div>
      </div>
    </div>
  </div>
);

// Wrapper component for lazy loading with suspense
const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
);

const publicRoutes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: withSuspense(<Landing />) },
      { path: 'login', element: withSuspense(<Login />) },
      { path: 'signup', element: withSuspense(<Signup />) },
      { path: 'forgot-password', element: withSuspense(<ForgotPassword />) },
      { path: 'reset-password', element: withSuspense(<ResetPassword />) },
      { path: 'verify-email', element: withSuspense(<VerifyEmail />) },
      { path: 'help', element: withSuspense(<Help />) },
      { path: 'faq', element: withSuspense(<FAQ />) },
      { path: 'terms', element: withSuspense(<Terms />) },
      { path: 'privacy', element: withSuspense(<Privacy />) },
      { path: 'maintenance', element: withSuspense(<Maintenance />) },
      { path: '404', element: withSuspense(<NotFound />) }
    ]
  },
  // Catch-all redirect to 404
  { path: '*', element: <Navigate to="/404" replace /> }
];

export default publicRoutes;

