
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Stores and Services
import { initializeStores } from './store';

// Components
import {
  LoadingSpinner,
  ErrorBoundary,
  ToastContainer,
  ThemeProvider,
  ProtectedRoute,
  Layout,
  AuthLayout,
} from './components';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Admin Pages
const AdminModule = lazy(() => import('../modules/AdminModule'));

// Create Query Client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Main App Component
const AppContent: React.FC = () => {
  useEffect(() => {
    // Initialize stores on app start
    const cleanup = initializeStores();
    return cleanup;
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastContainer />
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route index element={<Navigate to="/auth/login" replace />} />
              </Route>

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Admin Routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requiredRoles={['ADMIN']}>
                      <AdminModule />
                    </ProtectedRoute>
                  }
                />

                {/* Provider Routes */}
                <Route
                  path="provider"
                  element={
                    <ProtectedRoute requiredRoles={['PROVIDER']}>
                      <div />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/provider/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  {/* Add more provider routes here */}
                </Route>

                {/* Enterprise Routes */}
                <Route
                  path="enterprise"
                  element={
                    <ProtectedRoute requiredRoles={['ENTERPRISE']}>
                      <div />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/enterprise/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  {/* Add more enterprise routes here */}
                </Route>

                {/* Partner Routes */}
                <Route
                  path="partner"
                  element={
                    <ProtectedRoute requiredRoles={['PARTNER']}>
                      <div />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/partner/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  {/* Add more partner routes here */}
                </Route>
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Root App Component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
};

export default App;
