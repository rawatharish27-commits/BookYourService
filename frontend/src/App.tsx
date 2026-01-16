import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ============================================
// MAIN APP COMPONENT (ROUTED - NO ANIMATIONS)
// ============================================
// Purpose: Define Routes and Layouts.
// Stack: React + React Router v6.
// Type: Production-Grade (Role-Based Routing).
// 
// IMPORTANT:
// 1. Wraps everything in `PageTransition` (Standard HTML Div - No Framer Motion).
// 2. Enforces `ProtectedRoute` (RBAC).
// 3. Maps `frontend/src/routes/index.ts` (Centralized Routing).
// 4. No External Libs (Removed `framer-motion`, `lucide-react`).
// ============================================

// Import Services & Components (Assume they exist or created above)
import { ProtectedRoute } from './components/ui/ProtectedRoute'; // RBAC Guard
import { PageTransition } from './components/ui/PageTransition'; // Simplified Wrapper

// Mock Pages (Replace with actual imports)
import Home from './pages/Home';
import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';
// import CustomerDashboard from './pages/customer/Dashboard';
// import ProviderDashboard from './pages/provider/Dashboard';
// import AdminDashboard from './pages/admin/Dashboard';

// ============================================
// 1. PAGE WRAPPER (SIMPLE FADE)
// ============================================

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
};

// ============================================
// 2. APP COMPONENT
// ============================================

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <PageWrapper>
        <Routes>
          {/* ============================================
               PUBLIC ROUTES (NO AUTH REQUIRED)
               ============================================ */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}

          {/* ============================================
               CUSTOMER ROUTES (CUSTOMER ROLE)
               ============================================ */}
          <Route path="/c/*" element={
            <ProtectedRoute role="customer">
              {/* Note: Customer Dashboard needs to be created or imported */}
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Customer Dashboard</h1>
                    <p className="text-slate-600">Welcome to your account!</p>
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* ============================================
               PROVIDER ROUTES (PROVIDER ROLE)
               ============================================ */}
          <Route path="/p/*" element={
            <ProtectedRoute role="provider">
              {/* Note: Provider Dashboard needs to be created or imported */}
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Provider Dashboard</h1>
                    <p className="text-slate-600">Manage your jobs and earnings here.</p>
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* ============================================
               ADMIN ROUTES (ADMIN ROLE)
               ============================================ */}
          <Route path="/a/*" element={
            <ProtectedRoute role="admin">
              {/* Note: Admin Dashboard needs to be created or imported */}
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
                    <p className="text-slate-600">System Monitoring & Control.</p>
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          {/* ============================================
               FALLBACK (NO DEAD PAGES)
               ============================================ */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">404 - Page Not Found</h1>
                <p className="text-slate-600">The page you're looking for doesn't exist.</p>
                <a href="/" className="text-primary font-semibold hover:underline mt-4 inline-block">
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </PageWrapper>
    </BrowserRouter>
  );
};

export default App;
