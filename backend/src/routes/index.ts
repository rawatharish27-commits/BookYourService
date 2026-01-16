import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BookYourService API Routes are healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
