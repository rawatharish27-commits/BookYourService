import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

// GET /categories - Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const { isEnabled } = req.query;

    const where: any = {};
    if (isEnabled !== undefined) where.isEnabled = isEnabled === 'true';

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /categories/:id - Get single category
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id }
    });

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /categories - Create category (admin)
router.post('/', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.create({
      data: {
        id: uuidv4(),
        ...req.body,
        createdAt: new Date()
      }
    });

    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /categories/:id - Update category (admin)
router.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /categories/:id - Delete category (admin)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export { router as categoryRoutes };

