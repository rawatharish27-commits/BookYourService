import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.js';
import { prisma } from '../config/database.js';
import { PaymentStatus, PaymentMethod, UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /payments/create-intent - Create payment intent
router.post('/create-intent', authenticate, authorize(UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency, bookingId } = req.body;

    // TODO: Validate that the booking belongs to the user
    const payment = await prisma.payment.create({
      data: {
        id: uuidv4(),
        bookingId,
        amount,
        currency: currency || 'INR',
        paymentMethod: PaymentMethod.WALLET,
        status: PaymentStatus.PENDING
      }
    });

    res.json({ 
      success: true, 
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
        clientSecret: `pi_${uuidv4()}`
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /payments/confirm - Confirm payment
router.post('/confirm', authenticate, authorize(UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId, paymentMethod } = req.body;

    // TODO: Validate that the payment belongs to the user
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCESS,
        paymentMethod: paymentMethod || PaymentMethod.WALLET
      },
      include: { booking: true }
    });

    // Update booking payment status
    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: PaymentStatus.SUCCESS }
      });
    }

    res.json({ success: true, data: payment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /payments/history/:userId - Get payment history
router.get('/history/:userId', authenticate, authorize(UserRole.ADMIN, UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (req.user!.role === UserRole.USER && req.user!.id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const payments = await prisma.payment.findMany({
      where: {
        booking: { userId }
      },
      include: {
        booking: {
          select: { id: true, problemTitle: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: payments });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /payments/:id/refund - Refund payment (admin)
router.post('/:id/refund', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { amount, reason } = req.body;
    
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: { status: PaymentStatus.REFUNDED }
    });

    // Create refund ledger entry
    const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId } });
    if (booking) {
      await prisma.walletLedger.create({
        data: {
          id: uuidv4(),
          userId: booking.userId,
          bookingId: payment.bookingId,
          amount,
          type: 'CREDIT',
          category: 'REFUND',
          description: reason,
          createdAt: new Date()
        }
      });
    }

    res.json({ success: true, data: payment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export { router as paymentRoutes };

