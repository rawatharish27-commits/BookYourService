import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { JWT_CONFIG } from '../config/jwt.js';
import { UserRole, UserStatus, VerificationStatus, ProviderStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Custom errors for more specific feedback
export class AuthError extends Error {
  public code: string;
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes
const SLA_MINUTES = {
  GOLD: 30,
  SILVER: 90,
  BRONZE: 240
};

export interface LoginDto {
  phone: string;
  otp: string;
  role: UserRole;
}

export interface RegisterDto {
  phone: string;
  name: string;
  email?: string;
  password: string;
  role: UserRole;
  city?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  // Generate 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    const otp = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY);

    // Upsert user to store OTP even if they are just trying to login/register
    // Note: In a strict system, we might want to store OTPs in a separate Redis/Table
    // But for this flow, we assume the user record exists or we update it if it does.
    // However, for registration, the user might not exist yet.
    // Strategy: We will handle OTP storage during the specific action or assume user exists for login.
    // For registration, we usually verify OTP *before* creating the user or create a temporary record.
    // To keep it simple and consistent with your request:
    // We will assume sendOtp is called for existing users (login) or we store it in a temporary way?
    // Actually, your request says: Register -> Phone verify (OTP).
    // So we create the user first with isVerified=false, then send OTP.

    console.log(`[DEMO] OTP for ${phone}: ${otp}`);
    
    // Update user record with OTP
    await prisma.user.updateMany({
      where: { phone },
      data: { 
        otpHash: otp, // Storing plain OTP for demo, hash in prod
        otpExpiresAt 
      }
    });

    // In production, integrate with SMS provider:
    // await twilio.sendSMS(phone, `Your OTP is: ${otp}`);
    
    return { success: true, message: 'OTP sent successfully' };
  }

  // Register Customer
  async registerCustomer(dto: { phone: string; name: string; email?: string; city?: string }) {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { phone: dto.phone, role: UserRole.USER }
    });

    if (existingUser) {
      throw new AuthError('User already exists', 'USER_EXISTS');
    }

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        phone: dto.phone,
        name: dto.name,
        email: dto.email,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        verificationStatus: VerificationStatus.PENDING, // Waiting for OTP
        city: dto.city || 'MUMBAI',
      }
    });

    await this.sendOtp(dto.phone);
    await this.createAuditLog(user.id, 'USER_REGISTERED', 'User', user.id, { role: UserRole.USER });

    return { message: "OTP sent successfully" };
  }

  // Register Provider
  async registerProvider(dto: { phone: string; name: string; email?: string; city: string }) {
    const existingUser = await prisma.user.findFirst({
      where: { phone: dto.phone, role: UserRole.PROVIDER }
    });

    if (existingUser) {
      throw new AuthError('Provider already exists', 'USER_EXISTS');
    }

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        phone: dto.phone,
        name: dto.name,
        email: dto.email,
        role: UserRole.PROVIDER,
        status: UserStatus.PENDING,
        verificationStatus: VerificationStatus.PENDING, // Waiting for OTP
        city: dto.city,
        qualityScore: 80, // Initial score
      }
    });

    await this.sendOtp(dto.phone);
    await this.createAuditLog(user.id, 'PROVIDER_REGISTERED', 'User', user.id, { role: UserRole.PROVIDER });

    return { message: "OTP sent. Await admin approval after verification." };
  }

  // Verify OTP (Common)
  async verifyOtp(phone: string, otp: string, role: UserRole): Promise<{ message: string }> {
    const user = await prisma.user.findFirst({
      where: { phone, role }
    });

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // Check OTP match and expiry
    if (user.otpHash !== otp) {
      throw new AuthError('Invalid OTP', 'INVALID_OTP');
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new AuthError('OTP Expired', 'OTP_EXPIRED');
    }

    // Update status
    let newVerificationStatus = user.verificationStatus;
    
    if (role === UserRole.USER) {
      newVerificationStatus = VerificationStatus.ACTIVE;
    } else if (role === UserRole.PROVIDER) {
      // Provider moves to REGISTERED/KYC_PENDING, waiting for Admin
      newVerificationStatus = VerificationStatus.REGISTERED; 
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationStatus: newVerificationStatus,
        otpHash: null,
        otpExpiresAt: null
      }
    });

    return { message: "Verified successfully" };
  }

  // Login for Customers (Phone + OTP)
  async customerLogin(phone: string, otp: string): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await prisma.user.findFirst({
      where: { phone, role: UserRole.USER },
    });

    if (!user) {
      throw new AuthError('User not found. Please register first.', 'USER_NOT_FOUND');
    }

    // Verify OTP
    if (user.otpHash !== otp) {
       // For dev/demo purposes, we might want to keep '1234' as a backdoor if needed, 
       // but strictly following the prompt:
       throw new AuthError('Invalid OTP', 'INVALID_OTP');
    }
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new AuthError('OTP Expired', 'OTP_EXPIRED');
    }

    if (user.verificationStatus !== VerificationStatus.ACTIVE) {
      throw new AuthError('Account not verified', 'ACCOUNT_NOT_VERIFIED');
    }
    
    if (user.status !== UserStatus.ACTIVE) {
      throw new AuthError('Account not active', 'ACCOUNT_NOT_ACTIVE');
    }

    // Clear OTP after successful login
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { lastLogin: new Date(), otpHash: null, otpExpiresAt: null } 
    });
    
    return { user, tokens: await this.generateTokens(user) };
  }

  // Login for Providers (Phone + OTP)
  async providerLogin(phone: string, otp: string): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await prisma.user.findFirst({
      where: { phone, role: UserRole.PROVIDER },
    });

    if (!user) {
      throw new AuthError('Provider not found. Please register first.', 'USER_NOT_FOUND');
    }

    // Verify OTP
    if (user.otpHash !== otp) {
       throw new AuthError('Invalid OTP', 'INVALID_OTP');
    }
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new AuthError('OTP Expired', 'OTP_EXPIRED');
    }

    if (user.verificationStatus !== VerificationStatus.ADMIN_APPROVED) {
      throw new AuthError('Account pending admin approval', 'ACCOUNT_PENDING_APPROVAL');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AuthError('Account not active', 'ACCOUNT_NOT_ACTIVE');
    }

    // Clear OTP
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { lastLogin: new Date(), otpHash: null, otpExpiresAt: null } 
    });

    return { user, tokens: await this.generateTokens(user) };
  }

  // Login for Admins
  async adminLogin(email: string, password: string): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await prisma.user.findFirst({
      where: { email, role: UserRole.ADMIN },
    });

    if (!user || !user.passwordHash) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    if (user.status !== UserStatus.ACTIVE || user.verificationStatus !== VerificationStatus.ADMIN_APPROVED) {
      throw new AuthError('Account not active or approved', 'ACCOUNT_NOT_ACTIVE');
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    return { user, tokens: await this.generateTokens(user) };
  }

  // Refresh token
  async refreshToken(token: string): Promise<AuthTokens | null> {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.refreshSecret) as { id: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.refreshToken) {
        return null;
      }

      const refreshTokenMatches = await bcrypt.compare(token, user.refreshToken);

      if (!refreshTokenMatches) {
        return null;
      }

      const tokens = await this.generateTokens(user);
      await this.createAuditLog(user.id, 'TOKEN_REFRESH', 'User', user.id);
      
      return tokens;
    } catch {
      return null;
    }
  }

  // Logout
  async logout(userId: string): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }
    });
    await this.createAuditLog(userId, 'USER_LOGGED_OUT', 'User', userId);
  }

  // Get current user profile
  async getProfile(userId: string) {
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
        documentsUploaded: true,
        aadhaarNumber: true,
        panNumber: true,
        bankAccountNumber: true,
        upiId: true
      }
    });
  }

  // Update profile
  async updateProfile(userId: string, data: { name?: string; city?: string; email?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data
    });

    await this.createAuditLog(userId, 'PROFILE_UPDATED', 'User', userId, data);

    return user;
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

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
      data: { 
        passwordHash: newPasswordHash,
        refreshToken: null // Invalidate existing sessions
      }
    });

    await this.createAuditLog(userId, 'PASSWORD_CHANGED', 'User', userId);
    return true;
  }

  // Generate JWT tokens
  private async generateTokens(user: any): Promise<AuthTokens> {
    const expiresInSeconds = parseInt(JWT_CONFIG.expiresIn.replace('m', '')) * 60 || 900;
    
    const token = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone },
      JWT_CONFIG.secret,
      { expiresIn: expiresInSeconds }
    );

    const refreshExpiresInSeconds = parseInt(JWT_CONFIG.refreshExpiresIn.replace('d', '')) * 86400 || 604800;
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_CONFIG.refreshSecret,
      { expiresIn: refreshExpiresInSeconds }
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken }
    });

    return {
      token,
      refreshToken,
      expiresIn: expiresInSeconds
    };
  }

  // Create audit log
  private async createAuditLog(
    actorId: string,
    action: string,
    entity: string,
    entityId: string,
    metadata?: any
  ) {
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

export const authService = new AuthService();