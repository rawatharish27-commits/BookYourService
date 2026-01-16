import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.js';
import { bookingService } from '../services/booking.service.js';
import { UserRole } from '@prisma/client';

const router = Router();

const createBookingSchema = z.object({
  problemId: z.string().uuid(),
  city: z.string(),
  addons: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number()
  })).optional()
});

const updateBookingSchema = z.object({
  status: z.enum(['CREATED', 'VERIFIED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'PAID', 'CLOSED', 'CANCELLED']).optional(),
  providerId: z.string().uuid().optional(),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
  cancelReason: z.string().optional()
});

// GET /bookings - Get all bookings (with filters)
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const { status, city, fromDate, toDate, page, limit } = req.query;

    const filters = {
      userId: req.user?.role === 'USER' ? req.user.id : undefined,
      providerId: req.user?.role === 'PROVIDER' ? req.user.id : undefined,
      status: status as any,
      city: city as string,
      fromDate: fromDate as string,
      toDate: toDate as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 20
    };

    const result = await bookingService.getAll(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /bookings/:id - Get single booking
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const booking = await bookingService.getById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Check authorization
    if (req.user?.role === 'USER' && booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    if (req.user?.role === 'PROVIDER' && booking.providerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    res.json({ success: true, data: booking });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /bookings - Create booking
router.post('/', authenticate, authorize(UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const data = createBookingSchema.parse(req.body);
    const booking = await bookingService.create({
      userId: req.user!.id,
      ...data
    });
    res.json({ success: true, data: booking });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /bookings/:id - Update booking
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const data = updateBookingSchema.parse(req.body);
    const booking = await bookingService.update(req.params.id, data, req.user!.id);
    res.json({ success: true, data: booking });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /bookings/:id/cancel - Cancel booking
router.post('/:id/cancel', authenticate, authorize(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const booking = await bookingService.cancel(req.params.id, reason, req.user!.id);
    res.json({ success: true, data: booking });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /bookings/:id/rate - Rate booking
router.post('/:id/rate', authenticate, authorize(UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const { rating, review } = req.body;
    const booking = await bookingService.rate(req.params.id, rating, review);
    res.json({ success: true, data: booking });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /bookings/history/:userId - Get booking history
router.get('/history/:userId', authenticate, authorize(UserRole.ADMIN, UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (req.user!.id !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const result = await bookingService.getAll({ userId, limit: 100 });
    res.json({ success: true, data: result.bookings });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /bookings/stats - Get booking stats
router.get('/stats/summary', authenticate, authorize(UserRole.ADMIN, UserRole.PROVIDER, UserRole.USER), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await bookingService.getStats(req.user?.id);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export { router as bookingRoutes };
