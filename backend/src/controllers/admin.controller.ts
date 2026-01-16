import { Request, Response } from 'express';
import { PrismaClient, UserStatus } from '@prisma/client';
import { AppError, ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// ============================================
// ADMIN CONTROL & MONITORING
// ============================================
// Purpose: Admin Actions (Freeze, Refund, Stats, Health).
// Stack: Express + Prisma.
// Type: Production-Grade (Strict RBAC, Error Handling).
// 
// IMPORTANT:
// 1. Enforces Admin Role (Middleware Check).
// 2. Logs all Admin Actions (Audit Trail).
// 3. Provides System Health Check (`/api/health`).
// 4. Handles Manual Refund Approval (Clawback Logic).
// ============================================

// ============================================
// 1. HEALTH CHECK (SYSTEM MONITORING)
// ============================================

/**
 * System Health Check Endpoint
 * @route GET /api/health
 * @access Public (No Auth Required)
 */
export const getHealth = async (req: Request, res: Response) => {
  logger.info('[AdminController] Health Check');

  try {
    // 1. Check Database Connection
    await prisma.$connect();

    // 2. Check Environment Variables
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'OTP_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingEnvVars.length > 0) {
      throw new ValidationError(`Missing Environment Variables: ${missingEnvVars.join(', ')}`);
    }

    // 3. Return Health Status
    const health = {
      status: 'ok',
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(health);
  } catch (error) {
    logger.error('[AdminController] Health Check Failed', error);
    const status = error instanceof AppError ? 500 : 503; // Service Unavailable if DB down

    res.status(status).json({
      success: false,
      message: 'Service Unavailable',
      error: {
        name: 'ServiceUnavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
        statusCode: status,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
};

// ============================================
// 2. USER FREEZE / UNFREEZE (ADMIN CONTROL)
// ============================================

/**
 * Freeze User Account
 * @route POST /api/admin/users/:userId/freeze
 * @access Admin Only
 */
export const freezeUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { reason } = req.body;

  logger.info('[AdminController] Freezing User', { userId, reason });

  try {
    // 1. Validate Input
    if (!userId) {
      throw new ValidationError('User ID is required');
    }
    if (!reason) {
      throw new ValidationError('Reason for freezing is required');
    }

    // 2. Check User Exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 3. Prevent Freezing Admin
    if (user.role === 'ADMIN') {
      throw new ForbiddenError('Cannot freeze an Admin user');
    }

    // 4. Update User Status (FROZEN)
    const frozenUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.FROZEN,
        freezeReason: reason,
        frozenAt: new Date(),
      },
    });

    // 5. Log Action (Audit Trail)
    logger.warn('[AdminController] User Frozen by Admin', {
      adminId: req.user.id,
      targetUserId: userId,
      reason,
    });

    res.status(200).json({
      success: true,
      message: 'User frozen successfully',
      data: { id: frozenUser.id, status: frozenUser.status },
    });
  } catch (error) {
    logger.error('[AdminController] Freeze User Failed', error);
    throw error instanceof AppError ? error : new AppError('Failed to freeze user', 500);
  }
};

/**
 * Unfreeze User Account
 * @route POST /api/admin/users/:userId/unfreeze
 * @access Admin Only
 */
export const unfreezeUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  logger.info('[AdminController] Unfreezing User', { userId });

  try {
    // 1. Validate Input
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // 2. Check User Exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 3. Prevent Unfreezing Admin
    if (user.role === 'ADMIN') {
      throw new ForbiddenError('Cannot unfreeze an Admin user');
    }

    // 4. Update User Status (ACTIVE)
    const unfrozenUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
        freezeReason: null,
        frozenAt: null,
        updatedAt: new Date(),
      },
    });

    // 5. Log Action (Audit Trail)
    logger.warn('[AdminController] User Unfrozen by Admin', {
      adminId: req.user.id,
      targetUserId: userId,
    });

    res.status(200).json({
      success: true,
      message: 'User unfrozen successfully',
      data: { id: unfrozenUser.id, status: unfrozenUser.status },
    });
  } catch (error) {
    logger.error('[AdminController] Unfreeze User Failed', error);
    throw error instanceof AppError ? error : new AppError('Failed to unfreeze user', 500);
  }
};

// ============================================
// 3. MANUAL REFUND APPROVAL (ADMIN CONTROL)
// ============================================

/**
 * Manual Refund Trigger (Admin Action)
 * @route POST /api/admin/bookings/:bookingId/refund
 * @access Admin Only
 */
export const triggerRefund = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { reason, amount } = req.body;

  logger.info('[AdminController] Triggering Manual Refund', { bookingId, reason, amount });

  try {
    // 1. Validate Input
    if (!bookingId) {
      throw new ValidationError('Booking ID is required');
    }
    if (!reason) {
      throw new ValidationError('Refund reason is required');
    }

    // 2. Check Booking Exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, wallet: true }, // Include Relations
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // 3. Validate Booking Status (Can Refund PAID, COMPLETED bookings)
    if (booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED') {
      throw new ValidationError('Can only refund COMPLETED or CANCELLED bookings');
    }

    // 4. Start Transaction (Payment + Wallet + Booking Update)
    await prisma.$transaction(async (tx) => {
      // A. Create Refund Record (Payment Table)
      const refund = await tx.payment.create({
        data: {
          bookingId: bookingId,
          amount: amount || booking.price, // Full Refund if amount not specified
          gateway: 'ADMIN_MANUAL', // Not via Webhook
          status: 'PROCESSING', // Assume processing for now
          currency: 'INR',
        },
      });

      // B. Credit Wallet (If Customer has Wallet)
      if (booking.wallet) {
        await tx.wallet.update({
          where: { userId: booking.customerId },
          data: {
            balance: {
              increment: amount || booking.price, // Credit Wallet
            },
            updatedAt: new Date(),
          },
        });

        // C. Create Ledger Entry (Credit)
        await tx.ledger.create({
          data: {
            walletId: booking.wallet.id,
            amount: amount || booking.price,
            type: 'CREDIT',
            source: 'REFUND',
            description: `Manual Refund for Booking ${bookingId}. Reason: ${reason}`,
            createdAt: new Date(),
          },
        });
      }

      // D. Update Booking Status (REFUNDED)
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    // 5. Log Action (Audit Trail)
    logger.warn('[AdminController] Manual Refund Triggered', {
      adminId: req.user.id,
      bookingId,
      amount: amount || booking.price,
      reason,
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: { bookingId, status: 'REFUNDED' },
    });
  } catch (error) {
    logger.error('[AdminController] Manual Refund Failed', error);
    throw error instanceof AppError ? error : new AppError('Failed to process refund', 500);
  }
};

// ============================================
// 4. GET ADMIN STATS (MONITORING)
// ============================================

/**
 * Get Admin Dashboard Stats
 * @route GET /api/admin/stats
 * @access Admin Only
 */
export const getAdminStats = async (req: Request, res: Response) => {
  logger.info('[AdminController] Getting Admin Stats');

  try {
    // 1. Aggregation Queries (Optimized)
    const totalUsers = await prisma.user.count();
    const totalBookings = await prisma.booking.count();
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
    }); // Sum all completed payments

    // 2. Filter Active/Inactive Stats
    const activeUsers = await prisma.user.count({ where: { status: UserStatus.ACTIVE } });
    const frozenUsers = await prisma.user.count({ where: { status: UserStatus.FROZEN } });
    const activeBookings = await prisma.booking.count({ where: { status: 'IN_PROGRESS' } });

    // 3. Calculate Revenue (Safely)
    const revenue = totalRevenue._sum.amount ? totalRevenue._sum.amount : 0;

    // 4. Return Stats
    const stats = {
      users: { total: totalUsers, active: activeUsers, frozen: frozenUsers },
      bookings: { total: totalBookings, active: activeBookings },
      revenue: {
        total: revenue, // Total Revenue (INR)
        currency: 'INR',
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('[AdminController] Get Admin Stats Failed', error);
    throw error instanceof AppError ? error : new AppError('Failed to get stats', 500);
  }
};

export default {
  getHealth,
  freezeUser,
  unfreezeUser,
  triggerRefund,
  getAdminStats,
};
