import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// MAIN APP COMPONENT - ADVANCED SPA ROUTING
// ============================================
// Purpose: Define all routes with page transitions
// Stack: React 18 + React Router v6 + Framer Motion
// Type: Production-Grade with Advanced UI

// Import all pages
import LandingPage from './pages/public/Landing';
import AboutPage from './pages/public/AboutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// ============================================
// PAGE TRANSITION WRAPPER
// ============================================

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'customer' | 'provider' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const location = useLocation();

  // Check if user is authenticated
  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Check role-based access
  if (role && userRole !== role) {
    const dashboardPath = role === 'customer' ? '/c/dashboard' :
                         role === 'provider' ? '/p/dashboard' :
                         '/a/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return <PageTransition>{children}</PageTransition>;
};

// ============================================
// MAIN APP COMPONENT
// ============================================

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================
             PUBLIC ROUTES (NO AUTH REQUIRED)
             ============================================ */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ============================================
             CUSTOMER ROUTES (CUSTOMER ROLE)
             ============================================ */}
        <Route path="/c/*" element={
          <ProtectedRoute role="customer">
            <Routes>
              <Route path="/c/dashboard" element={<CustomerDashboard />} />
              <Route path="/c/bookings" element={<CustomerDashboard />} />
              <Route path="/c/profile" element={<CustomerDashboard />} />
              <Route path="/c/wallet" element={<CustomerDashboard />} />
              <Route path="/c/support" element={<CustomerDashboard />} />
              <Route path="/c/*" element={<CustomerDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* ============================================
             PROVIDER ROUTES (PROVIDER ROLE)
             ============================================ */}
        <Route path="/p/*" element={
          <ProtectedRoute role="provider">
            <Routes>
              <Route path="/p/dashboard" element={<ProviderDashboard />} />
              <Route path="/p/bookings" element={<ProviderDashboard />} />
              <Route path="/p/profile" element={<ProviderDashboard />} />
              <Route path="/p/earnings" element={<ProviderDashboard />} />
              <Route path="/p/*" element={<ProviderDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* ============================================
             ADMIN ROUTES (ADMIN ROLE)
             ============================================ */}
        <Route path="/a/*" element={
          <ProtectedRoute role="admin">
            <Routes>
              <Route path="/a/dashboard" element={<AdminDashboard />} />
              <Route path="/a/users" element={<AdminDashboard />} />
              <Route path="/a/providers" element={<AdminDashboard />} />
              <Route path="/a/bookings" element={<AdminDashboard />} />
              <Route path="/a/settings" element={<AdminDashboard />} />
              <Route path="/a/*" element={<AdminDashboard />} />
            </Routes>
          </ProtectedRoute>
        } />

        {/* ============================================
             FALLBACK ROUTE (404)
             ============================================ */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <span className="text-4xl">😕</span>
              </motion.div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                404 - Page Not Found
              </h1>
              <p className="text-slate-600 mb-6">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all"
              >
                Go to Homepage
              </motion.button>
            </motion.div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
