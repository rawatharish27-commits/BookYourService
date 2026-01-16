/**
 * Main Router Configuration - Central route registry
 */
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout, AuthLayout, FullscreenLayout } from '../layouts';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
const Landing = lazy(() => import('../pages/public/Landing'));
const Login = lazy(() => import('../pages/public/Login'));
const Signup = lazy(() => import('../pages/public/Signup'));
const NotFound = lazy(() => import('../pages/public/NotFound'));
const FAQ = lazy(() => import('../pages/public/FAQ'));
const Terms = lazy(() => import('../pages/public/Terms'));
const Privacy = lazy(() => import('../pages/public/Privacy'));
const Maintenance = lazy(() => import('../pages/public/Maintenance'));
const ForgotPassword = lazy(() => import('../pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/public/ResetPassword'));
const VerifyEmail = lazy(() => import('../pages/public/VerifyEmail'));

// Customer Pages
const CustomerDashboard = lazy(() => import('../pages/customer/Dashboard'));
const CustomerBookings = lazy(() => import('../pages/customer/Bookings'));
const CustomerWallet = lazy(() => import('../pages/customer/Wallet'));
const CustomerProfile = lazy(() => import('../pages/customer/Profile'));
const CustomerReviews = lazy(() => import('../pages/customer/Reviews'));
const CustomerNotifications = lazy(() => import('../pages/customer/Notifications'));
const CustomerSupport = lazy(() => import('../pages/customer/Support'));

// Provider Pages
const ProviderDashboard = lazy(() => import('../pages/provider/Dashboard'));
const ProviderBookings = lazy(() => import('../pages/provider/Bookings'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProviders = lazy(() => import('../pages/admin/Providers'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminBookings = lazy(() => import('../pages/admin/Bookings'));

// Loading Fallback
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-[#0A2540] flex items-center justify-center">
    <div className="w-16 h-16 bg-white rounded-[3rem] flex items-center justify-center text-5xl shadow-3xl animate-pulse">🛠️</div>
  </div>
);

const withSuspense = (element: React.ReactNode) => <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={withSuspense(<Landing />)} />
          <Route path="faq" element={withSuspense(<FAQ />)} />
          <Route path="terms" element={withSuspense(<Terms />)} />
          <Route path="privacy" element={withSuspense(<Privacy />)} />
        </Route>

        {/* Auth Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="login" element={withSuspense(<Login />)} />
          <Route path="signup" element={withSuspense(<Signup />)} />
          <Route path="forgot-password" element={withSuspense(<ForgotPassword />)} />
          <Route path="reset-password" element={withSuspense(<ResetPassword />)} />
          <Route path="verify-email" element={withSuspense(<VerifyEmail />)} />
        </Route>

        {/* Fullscreen Routes */}
        <Route path="/" element={<FullscreenLayout />}>
          <Route path="maintenance" element={withSuspense(<Maintenance />)} />
          <Route path="404" element={withSuspense(<NotFound />)} />
        </Route>

        {/* Customer Routes */}
        <Route path="/customer" element={<ProtectedRoute role="customer"><PublicLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={withSuspense(<CustomerDashboard />)} />
          <Route path="bookings" element={withSuspense(<CustomerBookings />)} />
          <Route path="wallet" element={withSuspense(<CustomerWallet />)} />
          <Route path="profile" element={withSuspense(<CustomerProfile />)} />
          <Route path="reviews" element={withSuspense(<CustomerReviews />)} />
          <Route path="notifications" element={withSuspense(<CustomerNotifications />)} />
          <Route path="support" element={withSuspense(<CustomerSupport />)} />
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
        </Route>

        {/* Provider Routes */}
        <Route path="/provider" element={<ProtectedRoute role="provider"><PublicLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={withSuspense(<ProviderDashboard />)} />
          <Route path="bookings" element={withSuspense(<ProviderBookings />)} />
          <Route index element={<Navigate to="/provider/dashboard" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><PublicLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={withSuspense(<AdminDashboard />)} />
          <Route path="providers" element={withSuspense(<AdminProviders />)} />
          <Route path="users" element={withSuspense(<AdminUsers />)} />
          <Route path="bookings" element={withSuspense(<AdminBookings />)} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

