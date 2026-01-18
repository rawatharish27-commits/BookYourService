import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Refactored Imports
import { useAuth } from './hooks/useAuth';
import { routeConfig, RouteConfig } from './routes/routeConfig';

// ============================================
// MAIN APP COMPONENT - REFACTORED FOR CENTRALIZED ROUTING
// ============================================
// Purpose: Dynamically render routes from a central config file.
// Stack: React 18 + React Router v6 + Framer Motion
// Type: Production-Grade with Advanced UI & Centralized Logic

// ============================================
// PAGE TRANSITION WRAPPER (No changes)
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
// PROTECTED ROUTE COMPONENT (Refactored to use useAuth hook)
// ============================================
interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'customer' | 'provider' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, role: userRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && userRole !== role) {
    // Redirect to the correct dashboard if roles mismatch
    const dashboardPath = `/${userRole?.charAt(0)}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <PageTransition>{children}</PageTransition>;
};

// ============================================
// ROUTE RENDERING LOGIC
// ============================================
const renderRoutes = (routes: RouteConfig[]) => {
  return routes.map(({ path, component: Component, isPublic, role, children }) => {
    const element = <Component />;
    
    if (!isPublic) {
      return (
        <Route key={path} path={path} element={<ProtectedRoute role={role}>{element}</ProtectedRoute>}>
          {children && renderRoutes(children)}
        </Route>
      );
    }
    
    return <Route key={path} path={path} element={<PageTransition>{element}</PageTransition>} />;
  });
};


// ============================================
// MAIN APP COMPONENT
// ============================================
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {renderRoutes(routeConfig)}

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
