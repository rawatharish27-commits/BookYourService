import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roleGuard.js'; // Use new Guard
import { adminController } from '../controllers/admin.controller.js';
import { UserRole, BookingStatus } from '@prisma/client';

const router = Router();

// GET /admin/dashboard - Dashboard stats
router.get('/dashboard', authenticate, allowRoles(UserRole.ADMIN), adminController.getDashboardStats);

// GET /admin/users - Get all users (admin)
router.get('/users', authenticate, allowRoles(UserRole.ADMIN), adminController.getAllUsers);

// GET /admin/bookings - Get all bookings (admin)
router.get('/bookings', authenticate, allowRoles(UserRole.ADMIN), adminController.getAllBookings);

// POST /admin/providers/:id/approve - Approve provider
router.post('/providers/:id/approve', authenticate, allowRoles(UserRole.ADMIN), adminController.approveProvider);

// POST /admin/providers/:id/reject - Reject provider
router.post('/providers/:id/reject', authenticate, allowRoles(UserRole.ADMIN), adminController.rejectProvider);

// POST /admin/users/:id/suspend - Suspend user
router.post('/users/:id/suspend', authenticate, allowRoles(UserRole.ADMIN), adminController.suspendUser);

export { router as adminRoutes };
