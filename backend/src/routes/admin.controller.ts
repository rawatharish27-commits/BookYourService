import { Request, Response } from 'express';
import { adminService } from '../services/admin.service.js';
import { AuthRequest } from '../middleware/auth.js';

export class AdminController {
  getDashboardStats = async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  };

  getAllUsers = async (req: Request, res: Response) => {
    const { page, limit, role, status, search } = req.query;
    const result = await adminService.getAllUsers(
      Number(page) || 1,
      Number(limit) || 20,
      { role, status, search }
    );
    res.json({ success: true, data: result });
  };

  getAllBookings = async (req: Request, res: Response) => {
    const { page, limit, status, fromDate, toDate } = req.query;
    const result = await adminService.getAllBookings(
      Number(page) || 1,
      Number(limit) || 20,
      { status, fromDate, toDate }
    );
    res.json({ success: true, data: result });
  };

  approveProvider = async (req: AuthRequest, res: Response) => {
    const { notes } = req.body;
    const result = await adminService.reviewProvider(req.params.id, 'APPROVED', req.user!.id, notes);
    res.json({ success: true, data: result });
  };

  rejectProvider = async (req: AuthRequest, res: Response) => {
    const { notes } = req.body;
    const result = await adminService.reviewProvider(req.params.id, 'REJECTED', req.user!.id, notes);
    res.json({ success: true, data: result });
  };

  suspendUser = async (req: Request, res: Response) => {
    const result = await adminService.suspendUser(req.params.id);
    res.json({ success: true, data: result });
  };
}

export const adminController = new AdminController();