// ============================================
// ROUTES CONFIGURATION REGISTRY (OPTION 5 - NO DEAD PAGES)
// ============================================
// Purpose: Central mapping of Page -> Layout -> Role.
// Stack: TypeScript.
// Type: Production-Grade (Single Source of Truth).
// 
// IMPORTANT:
// 1. This file acts as "Route Registry".
// 2. It maps every public/private page to its Layout and Role requirement.
// 3. It eliminates "Dead Pages" (Unmapped URLs = 404).
// 4. It enforces RBAC (Role-based Access).
// ============================================

export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<any, any>;
  layout: 'PublicLayout' | 'AuthLayout' | 'CustomerLayout' | 'ProviderLayout' | 'AdminLayout';
  role?: 'CUSTOMER' | 'PROVIDER' | 'ADMIN'; // Optional: Public pages don't need role
}

export const routeRegistry: RouteConfig[] = [
  // ============================================
  // 1. PUBLIC ROUTES (NO AUTH REQUIRED)
  // ============================================
  {
    path: '/',
    component: () => import('../pages/Home').then(m => m.default),
    layout: 'PublicLayout',
  },
  {
    path: '/about',
    component: () => import('../pages/About').then(m => m.default),
    layout: 'PublicLayout',
  },
  {
    path: '/contact',
    component: () => import('../pages/Contact').then(m => m.default),
    layout: 'PublicLayout',
  },

  // ============================================
  // 2. AUTH ROUTES (NO ROLE CHECK, BUT AUTH STATE REQUIRED)
  // ============================================
  {
    path: '/login',
    component: () => import('../pages/auth/Login').then(m => m.default),
    layout: 'AuthLayout',
  },
  {
    path: '/register',
    component: () => import('../pages/auth/Register').then(m => m.default),
    layout: 'AuthLayout',
  },
  {
    path: '/forgot-password',
    component: () => import('../pages/auth/ForgotPassword').then(m => m.default),
    layout: 'AuthLayout',
  },

  // ============================================
  // 3. CUSTOMER ROUTES (ROLE: CUSTOMER)
  // ============================================
  {
    path: '/c/dashboard',
    component: () => import('../pages/customer/Dashboard').then(m => m.default),
    layout: 'CustomerLayout',
    role: 'CUSTOMER',
  },
  {
    path: '/c/bookings',
    component: () => import('../pages/customer/Bookings').then(m => m.default),
    layout: 'CustomerLayout',
    role: 'CUSTOMER',
  },
  {
    path: '/c/wallet',
    component: () => import('../pages/customer/Wallet').then(m => m.default),
    layout: 'CustomerLayout',
    role: 'CUSTOMER',
  },

  // ============================================
  // 4. PROVIDER ROUTES (ROLE: PROVIDER)
  // ============================================
  {
    path: '/p/dashboard',
    component: () => import('../pages/provider/Dashboard').then(m => m.default),
    layout: 'ProviderLayout',
    role: 'PROVIDER',
  },
  {
    path: '/p/jobs',
    component: () => import('../pages/provider/Jobs').then(m => m.default),
    layout: 'ProviderLayout',
    role: 'PROVIDER',
  },
  {
    path: '/p/earnings',
    component: () => import('../pages/provider/Earnings').then(m => m.default),
    layout: 'ProviderLayout',
    role: 'PROVIDER',
  },

  // ============================================
  // 5. ADMIN ROUTES (ROLE: ADMIN)
  // ============================================
  {
    path: '/a/dashboard',
    component: () => import('../pages/admin/Dashboard').then(m => m.default),
    layout: 'AdminLayout',
    role: 'ADMIN',
  },
  {
    path: '/a/users',
    component: () => import('../pages/admin/Users').then(m => m.default),
    layout: 'AdminLayout',
    role: 'ADMIN',
  },
  {
    path: '/a/bookings',
    component: () => import('../pages/admin/Bookings').then(m => m.default),
    layout: 'AdminLayout',
    role: 'ADMIN',
  },
  {
    path: '/a/settings',
    component: () => import('../pages/admin/Settings').then(m => m.default),
    layout: 'AdminLayout',
    role: 'ADMIN',
  },

  // ============================================
  // 6. FALLBACK (NO DEAD PAGES)
  // ============================================
  {
    path: '*',
    component: () => import('../pages/NotFound').then(m => m.default),
    layout: 'PublicLayout', // 404 Page
  },
];

// ============================================
// 7. HELPER FUNCTION: GET LAYOUT COMPONENT
// ============================================

export const getLayoutComponent = (layoutName: string) => {
  switch (layoutName) {
    case 'PublicLayout':
      return () => import('../layouts/PublicLayout').then(m => m.default);
    case 'AuthLayout':
      return () => import('../layouts/AuthLayout').then(m => m.default);
    case 'CustomerLayout':
      return () => import('../layouts/CustomerLayout').then(m => m.default);
    case 'ProviderLayout':
      return () => import('../layouts/ProviderLayout').then(m => m.default);
    case 'AdminLayout':
      return () => import('../layouts/AdminLayout').then(m => m.default);
    default:
      return () => import('../layouts/PublicLayout').then(m => m.default); // Fallback
  }
};

export default routeRegistry;
