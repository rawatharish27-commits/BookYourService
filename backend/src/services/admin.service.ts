import { prisma } from '../config/database.js';
import { UserRole, UserStatus, VerificationStatus, BookingStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class AdminService {
  async getDashboardStats() {
    const [totalUsers, totalProviders, totalBookings, revenue] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.USER } }),
      prisma.user.count({ where: { role: UserRole.PROVIDER } }),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      })
    ]);

    return {
      users: totalUsers,
      providers: totalProviders,
      bookings: totalBookings,
      revenue: revenue._sum.amount || 0
    };
  }

  async getAllUsers(page: number, limit: number, filters: any) {
    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, phone: true, role: true, 
          status: true, verificationStatus: true, city: true, createdAt: true,
          lastLogin: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAllBookings(page: number, limit: number, filters: any) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.fromDate && filters.toDate) {
      where.createdAt = {
        gte: new Date(filters.fromDate),
        lte: new Date(filters.toDate)
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } },
          provider: { select: { name: true, phone: true } },
          problem: { select: { title: true, category: true } }
        }
      }),
      prisma.booking.count({ where })
    ]);

    return { bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async reviewProvider(providerId: string, decision: 'APPROVED' | 'REJECTED', adminId: string, notes?: string) {
    const status = decision === 'APPROVED' ? VerificationStatus.ADMIN_APPROVED : VerificationStatus.REJECTED;
    
    const provider = await prisma.user.update({
      where: { id: providerId },
      data: { 
        verificationStatus: status,
        status: decision === 'APPROVED' ? UserStatus.ACTIVE : UserStatus.SUSPENDED
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        actorId: adminId,
        action: `PROVIDER_${decision}`,
        entity: 'User',
        entityId: providerId,
        metadata: { notes }
      }
    });

    return provider;
  }

  async suspendUser(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED }
    });
  }

  // ... other methods (audit logs, config) can be added similarly
}

export const adminService = new AdminService();