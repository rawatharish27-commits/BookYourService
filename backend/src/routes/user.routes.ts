import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest, authorize } from '../middleware/auth.js';
import { userService } from '../services/user.service.js';
import { UserRole } from '@prisma/client';

const router = Router();

// GET /users/profile - Get current user profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.getById(req.user!.id);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /users/profile - Update current user profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, city, email } = req.body;
    const user = await userService.update(req.user!.id, { name, city, email });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /users/change-password - Change password
router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const success = await userService.changePassword(req.user!.id, currentPassword, newPassword);
    
    if (!success) {
      return res.status(400).json({ success: false, error: 'Invalid current password' });
    }
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /users/wallet - Get wallet balance
router.get('/wallet', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const balance = await userService.getWalletBalance(req.user!.id);
    const ledger = await userService.getWalletLedger(req.user!.id);
    res.json({ success: true, data: { balance, ledger } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /users/:id - Get user by ID (admin only)
router.get('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.getById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /users/:id - Update user (admin only)
router.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /users/:id/suspend - Suspend user (admin only)
router.post('/:id/suspend', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const user = await userService.suspend(req.params.id, reason, req.user!.id);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /users/:id/activate - Activate user (admin only)
router.post('/:id/activate', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.activate(req.params.id, req.user!.id);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /users/:id/documents - Upload documents (provider)
router.post('/:id/documents', authenticate, authorize(UserRole.ADMIN, UserRole.PROVIDER), async (req: AuthRequest, res: Response) => {
  try {

    if(req.user?.role === UserRole.PROVIDER && req.user?.id !== req.params.id){
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { aadhaarNumber, panNumber, bankAccountNumber, bankIfsc, upiId } = req.body;
    const user = await userService.uploadDocuments(req.params.id, {
      aadhaarNumber,
      panNumber,
      bankAccountNumber,
      bankIfsc,
      upiId
    });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /users/stats/summary - Get user stats (admin)
router.get('/stats/summary', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await userService.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export { router as userRoutes };

