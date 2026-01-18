// src/routes/routeConfig.tsx

import React from 'react';

// Import Page Components
import LandingPage from '../pages/public/Landing';
import AboutPage from '../pages/public/AboutPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import ProviderDashboard from '../pages/provider/ProviderDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

export type AppRole = 'customer' | 'provider' | 'admin';

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  role?: AppRole; // The role required to access this route
  children?: RouteConfig[]; // For nested routes
  isPublic?: boolean; // True for routes accessible without login
}

export const routeConfig: RouteConfig[] = [
  // Public Routes
  { path: '/', component: LandingPage, isPublic: true },
  { path: '/about', component: AboutPage, isPublic: true },
  { path: '/login', component: LoginPage, isPublic: true },
  { path: '/register', component: RegisterPage, isPublic: true },

  // Customer Routes
  {
    path: '/c/dashboard',
    component: CustomerDashboard,
    role: 'customer',
  },
  // Add other customer-specific routes here
  // e.g., { path: '/c/bookings', component: CustomerBookings, role: 'customer' },


  // Provider Routes
  {
    path: '/p/dashboard',
    component: ProviderDashboard,
    role: 'provider',
  },
  // Add other provider-specific routes here

  // Admin Routes
  {
    path: '/a/dashboard',
    component: AdminDashboard,
    role: 'admin',
  },
  // Add other admin-specific routes here
];
