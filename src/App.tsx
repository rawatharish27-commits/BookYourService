import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Loader from './components/ui/Loader';
import CookieConsent from './components/system/CookieConsent';
import { Role } from './types';

// Public Pages
const Home = lazy(() => import('./pages/public/Home').then(m => ({ default: m.Home })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const CategoryPage = lazy(() => import('./pages/client/CategoryPage').then(m => ({ default: m.CategoryPage })));
const SubCategoryPage = lazy(() => import('./pages/client/SubCategoryPage').then(m => ({ default: m.SubCategoryPage })));
const ServicePage = lazy(() => import('./pages/client/ServicePage').then(m => ({ default: m.ServicePage })));

// Client Protected
const MyBookings = lazy(() => import('./pages/client/MyBookings').then(m => ({ default: m.MyBookings })));
const BookingPage = lazy(() => import('./pages/client/BookingPage').then(m => ({ default: m.BookingPage })));
const BookingStatusPage = lazy(() => import('./pages/client/BookingStatusPage').then(m => ({ default: m.BookingStatusPage })));
const PaymentPage = lazy(() => import('./pages/client/PaymentPage').then(m => ({ default: m.PaymentPage })));
const ReviewPage = lazy(() => import('./pages/client/ReviewPage').then(m => ({ default: m.ReviewPage })));

// Provider Protected
const ProviderDashboard = lazy(() => import('./pages/provider/ProviderDashboard').then(m => ({ default: m.ProviderDashboard })));
const ProviderOnboarding = lazy(() => import('./pages/provider/ProviderOnboarding').then(m => ({ default: m.ProviderOnboarding })));
const ProviderBookings = lazy(() => import('./pages/provider/ProviderBookings').then(m => ({ default: m.ProviderBookings })));
const ProviderAvailability = lazy(() => import('./pages/provider/ProviderAvailability'));

// Admin Protected
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

/**
 * 🛡️ PHASE 2: FRONTEND ROUTE GUARD
 * Blocks unauthorized role-based access and handles onboarding status.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: Role[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Forbidden: Redirect to appropriate landing based on their actual role
    const fallback = user.role === Role.ADMIN ? '/admin' : user.role === Role.PROVIDER ? '/provider' : '/services';
    return <Navigate to={fallback} replace />;
  }

  // Provider Compliance Check: Mandatory Onboarding
  if (user.role === Role.PROVIDER && 
      location.pathname !== '/provider/onboarding' && 
      user.verificationStatus !== 'LIVE') {
        return <Navigate to="/provider/onboarding" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthPage />} />
            
            {/* Discovery */}
            <Route path="/services/:categorySlug" element={<CategoryPage />} />
            <Route path="/services/:categorySlug/:subCategorySlug" element={<SubCategoryPage />} />
            <Route path="/services/:categorySlug/:subCategorySlug/detail" element={<ServicePage />} />

            {/* 🛡️ CLIENT PROTECTED */}
            <Route path="/client/bookings" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/services/:categorySlug/:subCategorySlug/book" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="/bookings/:id" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <BookingStatusPage />
              </ProtectedRoute>
            } />
            <Route path="/payments/:bookingId" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/bookings/:bookingId/review" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <ReviewPage />
              </ProtectedRoute>
            } />

            {/* 🛡️ PROVIDER PROTECTED */}
            <Route path="/provider/onboarding" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT, Role.PROVIDER]}>
                <ProviderOnboarding />
              </ProtectedRoute>
            } />
            <Route path="/provider" element={
              <ProtectedRoute allowedRoles={[Role.PROVIDER]}>
                <ProviderDashboard />
              </ProtectedRoute>
            } />
            <Route path="/provider/bookings" element={
              <ProtectedRoute allowedRoles={[Role.PROVIDER]}>
                <ProviderBookings />
              </ProtectedRoute>
            } />
            <Route path="/provider/availability" element={
              <ProtectedRoute allowedRoles={[Role.PROVIDER]}>
                <ProviderAvailability />
              </ProtectedRoute>
            } />

            {/* 🛡️ ADMIN PROTECTED */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <AuthProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AuthProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}