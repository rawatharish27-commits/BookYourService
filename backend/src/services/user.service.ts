import { prisma } from '../config/database.js';
import { UserRole, UserStatus, VerificationStatus, ProviderStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface UpdateUserDto {
  name?: string;
  city?: string;
  email?: string;
  providerStatus?: ProviderStatus;
  status?: UserStatus;
  verificationStatus?: VerificationStatus;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  // Get user by ID
  async getById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        role: true,
        status: true,
        verificationStatus: true,
        city: true,
        walletBalance: true,
        qualityScore: true,
        jobCount: true,
        isProbation: true,
        lastLogin: true,
        createdAt: true,
        documentsUploaded: true
      }
    });
  }

  // Get all users with filters
  async getAll(filters: UserFilters) {
    const { role, status, city, search, page = 1, limit = 20 } = filters;

    const where: any = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (city) where.city = city;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          email: true,
          name: true,
          role: true,
          status: true,
          verificationStatus: true,
          city: true,
          walletBalance: true,
          qualityScore: true,
          jobCount: true,
          isProbation: true,
          lastLogin: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Update user
  async update(userId: string, dto: UpdateUserDto) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: dto
    });

    await this.createAuditLog(userId, 'USER_UPDATED', 'User', userId, dto);

    return user;
  }

  // Suspend user
  async suspend(userId: string, reason: string, actorId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.SUSPENDED
      }
    });

    await this.createAuditLog(actorId, 'USER_SUSPENDED', 'User', userId, { reason });

    return user;
  }

  // Activate user
  async activate(userId: string, actorId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE
      }
    });

    await this.createAuditLog(actorId, 'USER_ACTIVATED', 'User', userId);

    return user;
  }

  // Approve provider
  async approveProvider(providerId: string, actorId: string) {
    const user = await prisma.user.update({
      where: { id: providerId },
      data: {
        status: UserStatus.APPROVED,
        verificationStatus: VerificationStatus.ACTIVE,
        isProbation: false
      }
    });

    await this.createAuditLog(actorId, 'PROVIDER_APPROVED', 'User', providerId);

    return user;
  }

  // Reject provider
  async rejectProvider(providerId: string, reason: string, actorId: string) {
    const user = await prisma.user.update({
      where: { id: providerId },
      data: {
        status: UserStatus.REJECTED,
        verificationStatus: VerificationStatus.REJECTED
      }
    });

    await this.createAuditLog(actorId, 'PROVIDER_REJECTED', 'User', providerId, { reason });

    return user;
  }

  // Upload documents
  async uploadDocuments(userId: string, documents: {
    aadhaarNumber?: string;
    panNumber?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    upiId?: string;
  }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        documentsUploaded: true,
        aadhaarNumber: documents.aadhaarNumber,
        panNumber: documents.panNumber,
        bankAccountNumber: documents.bankAccountNumber,
        bankIfsc: documents.bankIfsc,
        upiId: documents.upiId,
        verificationStatus: VerificationStatus.BANK_PENDING
      }
    });

    await this.createAuditLog(userId, 'DOCUMENTS_UPLOADED', 'User', userId);

    return user;
  }

  // Get user stats
  async getStats() {
    const [
      totalUsers,
      totalProviders,
      activeProviders,
      suspendedUsers,
      pendingProviders
    ] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.USER } }),
      prisma.user.count({ where: { role: UserRole.PROVIDER } }),
      prisma.user.count({ where: { role: UserRole.PROVIDER, providerStatus: ProviderStatus.ONLINE } }),
      prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      prisma.user.count({ where: { role: UserRole.PROVIDER, status: UserStatus.UNDER_REVIEW } })
    ]);

    return {
      totalUsers,
      totalProviders,
      activeProviders,
      suspendedUsers,
      pendingProviders
    };
  }

  // Get wallet balance
  async getWalletBalance(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true }
    });

    return user?.walletBalance || 0;
  }

  // Get wallet ledger
  async getWalletLedger(userId: string, page = 1, limit = 20) {
    const [ledger, total] = await Promise.all([
      prisma.walletLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.walletLedger.count({ where: { userId } })
    ]);

    return {
      ledger,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Update wallet balance
  async updateBalance(userId: string, amount: number, type: 'CREDIT' | 'DEBIT', category: string, description?: string, bookingId?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    if (type === 'DEBIT' && user.walletBalance < amount) {
      throw new Error('Insufficient balance');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: type === 'CREDIT' ? amount : -amount
          }
        }
      }),
      prisma.walletLedger.create({
        data: {
          id: uuidv4(),
          userId,
          amount,
          type,
          category,
          description,
          bookingId,
          createdAt: new Date()
        }
      })
    ]);

    return { success: true, newBalance: user.walletBalance + (type === 'CREDIT' ? amount : -amount) };
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.passwordHash) {
      return false;
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return false;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    await this.createAuditLog(userId, 'PASSWORD_CHANGED', 'User', userId);
    return true;
  }

  // Create audit log
  private async createAuditLog(actorId: string, action: string, entity: string, entityId: string, metadata?: any) {
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        actorId,
        action,
        entity,
        entityId,
        metadata,
        createdAt: new Date()
      }
    });
  }
}

export const userService = new UserService();

