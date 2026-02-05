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

// Public Pages (Lazy Loaded)
const Home = lazy(() => import('./pages/public/Home').then(m => ({ default: m.Home })));
const TermsPage = lazy(() => import('./pages/public/Terms').then(m => ({ default: m.TermsPage })));
const FAQPage = lazy(() => import('./pages/public/FAQ').then(m => ({ default: m.FAQPage })));
const ContactPage = lazy(() => import('./pages/public/Contact').then(m => ({ default: m.ContactPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const CategoryPage = lazy(() => import('./pages/client/CategoryPage').then(m => ({ default: m.CategoryPage })));
const SubCategoryPage = lazy(() => import('./pages/client/SubCategoryPage').then(m => ({ default: m.SubCategoryPage })));
const ServicePage = lazy(() => import('./pages/client/ServicePage').then(m => ({ default: m.ServicePage })));
const AboutPage = lazy(() => import('./pages/public/AboutPage').then(m => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const CategoriesIndex = lazy(() => import('./pages/public/CategoriesIndex').then(m => ({ default: m.CategoriesIndex })));
const LocalServicePage = lazy(() => import('./pages/public/LocalServicePage').then(m => ({ default: m.LocalServicePage })));
const CityIndex = lazy(() => import('./pages/public/CityIndex').then(m => ({ default: m.CityIndex })));
const CityCategoryPage = lazy(() => import('./pages/public/CityCategoryPage').then(m => ({ default: m.CityCategoryPage })));
const ProviderPublicProfile = lazy(() => import('./pages/public/ProviderPublicProfile').then(m => ({ default: m.ProviderPublicProfile })));

// Auth-Protected Pages
const MyBookings = lazy(() => import('./pages/client/MyBookings').then(m => ({ default: m.MyBookings })));
const BookingPage = lazy(() => import('./pages/client/BookingPage').then(m => ({ default: m.BookingPage })));
const BookingStatusPage = lazy(() => import('./pages/client/BookingStatusPage').then(m => ({ default: m.BookingStatusPage })));
const PaymentPage = lazy(() => import('./pages/client/PaymentPage').then(m => ({ default: m.PaymentPage })));
const ReviewPage = lazy(() => import('./pages/client/ReviewPage').then(m => ({ default: m.ReviewPage })));

const PaymentSuccess = lazy(() => import('./pages/client/PaymentSuccess'));
const PaymentFailure = lazy(() => import('./pages/client/PaymentFailure'));
const Profile = lazy(() => import('./pages/client/Profile'));
const Addresses = lazy(() => import('./pages/client/Addresses'));
const OrderDetail = lazy(() => import('./pages/client/OrderDetail'));
const Invoice = lazy(() => import('./pages/client/Invoice'));
const Support = lazy(() => import('./pages/client/Support'));

// Provider Pages
const ProviderDashboard = lazy(() => import('./pages/provider/ProviderDashboard').then(m => ({ default: m.ProviderDashboard })));
const ProviderBookings = lazy(() => import('./pages/provider/ProviderBookings').then(m => ({ default: m.ProviderBookings })));
const ProviderAvailability = lazy(() => import('./pages/provider/ProviderAvailability'));
const ProviderOnboarding = lazy(() => import('./pages/provider/ProviderOnboarding').then(m => ({ default: m.ProviderOnboarding })));
const CreateService = lazy(() => import('./pages/provider/CreateService').then(m => ({ default: m.CreateService })));
const MyServices = lazy(() => import('./pages/provider/MyServices'));
const Earnings = lazy(() => import('./pages/provider/Earnings'));
const ProviderReviews = lazy(() => import('./pages/provider/ProviderReviews'));
const Notifications = lazy(() => import('./pages/provider/Notifications'));
const ProviderSupport = lazy(() => import('./pages/provider/Support'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

import { Role } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: Role[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="p-20 text-center flex flex-col items-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <p className="text-gray-600 font-medium">Access Denied: Restricted Area</p>
      </div>
    );
  }

  // Robust path detection for HashRouter
  const isAtOnboarding = location.pathname.replace(/\/$/, '') === '/provider/onboarding';

  if (user.role === Role.PROVIDER && 
      !isAtOnboarding && 
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
            {/* 1. PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            <Route path="/browse" element={<ClientDashboard />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/categories" element={<CategoriesIndex />} />
            <Route path="/provider/:slug" element={<ProviderPublicProfile />} />
            
            {/* SEO Dynamic City Hubs */}
            <Route path="/cities" element={<CityIndex />} />
            <Route path="/:city/:categorySlug" element={<CityCategoryPage />} />
            <Route path="/:city/:serviceSlug" element={<LocalServicePage />} />
            
            <Route path="/services/:categorySlug" element={<CategoryPage />} />
            <Route path="/services/:categorySlug/:subCategorySlug" element={<SubCategoryPage />} />
            <Route path="/services/:categorySlug/:subCategorySlug/detail" element={<ServicePage />} />

            {/* 2. CLIENT PROTECTED */}
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
            <Route path="/bookings/:bookingId/review" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <ReviewPage />
              </ProtectedRoute>
            } />
            <Route path="/payments/:bookingId" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/payment/success/:bookingId" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            <Route path="/payment/failure/:bookingId" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <PaymentFailure />
              </ProtectedRoute>
            } />
            <Route path="/client/profile" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/client/addresses" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <Addresses />
              </ProtectedRoute>
            } />
            <Route path="/client/order/:bookingId" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <OrderDetail />
              </ProtectedRoute>
            } />
            <Route path="/client/invoice/:bookingId" element={
              <ProtectedRoute allowedRoles={[Role.CLIENT]}>
                <Invoice />
              </ProtectedRoute>
            } />
            <Route path="/support" element={<Support />} />

            {/* 3. PROVIDER PROTECTED */}
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
            <Route path="/provider/create-service" element={
              <ProtectedRoute allowedRoles={[Role.PROVIDER]}>
                <CreateService />
              </ProtectedRoute>
            } />
            <Route path="/provider/services" element={
              <ProtectedRoute allowedRoles={[Role.PROVIDER]}>
                <MyServices />
              </ProtectedRoute>
            } />
            <Route path="/provider/earnings" element={
              <ProtectedRoute allowedRoles={[Role.PROVIDER]}>
                <Earnings />
              </ProtectedRoute>
            } />
            <Route path="/provider/reviews" element={
              <ProtectedRoute allowedRoles={[Role.PROVIDER]}>
                <ProviderReviews />
              </ProtectedRoute>
            } />
            <Route path="/provider/notifications" element={
              <ProtectedRoute allowedRoles={[Role.PROVIDER]}>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/provider/support" element={
              <ProtectedRoute allowedRoles={[Role.PROVIDER]}>
                <ProviderSupport />
              </ProtectedRoute>
            } />

            {/* 4. ADMIN PROTECTED */}
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