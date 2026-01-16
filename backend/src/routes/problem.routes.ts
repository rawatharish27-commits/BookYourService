import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /problems - Get all problems/services
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, slaTier, isEnabled, search, page = 1, limit = 50 } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (slaTier) where.slaTier = slaTier;
    if (isEnabled !== undefined) where.isEnabled = isEnabled === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        orderBy: { title: 'asc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string)
      }),
      prisma.problem.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        problems,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /problems/:id - Get single problem
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id }
    });

    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    res.json({ success: true, data: problem });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /problems - Create problem (admin)
router.post('/', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const problem = await prisma.problem.create({
      data: {
        id: uuidv4(),
        ...req.body,
        createdAt: new Date()
      }
    });

    res.json({ success: true, data: problem });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /problems/:id - Update problem (admin)
router.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const problem = await prisma.problem.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ success: true, data: problem });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /problems/:id - Delete problem (admin)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    await prisma.problem.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Problem deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export { router as problemRoutes };

