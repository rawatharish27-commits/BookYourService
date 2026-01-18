import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { asyncHandler, BadRequestError, UnauthorizedError, NotFoundError, InternalServerError, AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, password, role, fullName } = req.body;
  logger.info('[AUTH:REGISTER]', { email, phone, role });

  if (!password) {
    throw new BadRequestError('Password is required');
  }

  if (!email && !phone) {
    throw new BadRequestError('Email or Phone is required');
  }

  if (role !== 'CUSTOMER' && role !== 'PROVIDER') {
    throw new BadRequestError('Invalid Role. Must be CUSTOMER or PROVIDER');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: 'mock-uuid-1234',
    email: email || null,
    phone: phone || null,
    passwordHash,
    role,
    fullName: fullName || null,
    status: 'PENDING_VERIFICATION',
    createdAt: new Date().toISOString(),
  };

  logger.info('[AUTH:REGISTER] User created successfully', { userId: newUser.id, role });

  const token = jwt.sign({ userId: newUser.id, role: newUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify OTP.',
    data: {
      userId: newUser.id,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        fullName: newUser.fullName,
        status: newUser.status,
      },
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, password } = req.body;
  logger.info('[AUTH:LOGIN]', { email, phone });

  if (!password) {
    throw new BadRequestError('Password is required');
  }

  if (!email && !phone) {
    throw new BadRequestError('Email or Phone is required');
  }

  const user = {
    id: 'mock-uuid-1234',
    email: email || null,
    phone: phone || null,
    passwordHash: '$2a$10$GK2z...',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  };

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    logger.warn('[AUTH:LOGIN] Password mismatch', { userId: user.id });
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'secret', { expiresIn: '7d' });

  logger.info('[AUTH:LOGIN] User logged in successfully', { userId: user.id, role: user.role });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token
  logger.info('[AUTH:LOGOUT]', { token });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone, email } = req.body;
  logger.info('[AUTH:SEND-OTP]', { phone, email });

  if (!phone && !email) {
    throw new BadRequestError('Phone or Email is required');
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 1234
  const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();

  logger.info('[AUTH:SEND-OTP] OTP Generated', { otp });

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      expiresAt,
    },
  });
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone, email, otp } = req.body;
  logger.info('[AUTH:VERIFY-OTP]', { phone, email, otp });

  if (!otp) {
    throw new BadRequestError('OTP is required');
  }

  if (!phone && !email) {
    throw new BadRequestError('Phone or Email is required');
  }

  const user = {
    id: 'mock-uuid-1234',
    otpCode: '1234',
    otpExpiresAt: new Date(Date.now() + 5 * 60000).toISOString(),
    status: 'PENDING_VERIFICATION',
  };

  if (new Date() > new Date(user.otpExpiresAt)) {
    logger.warn('[AUTH:VERIFY-OTP] OTP expired', { userId: user.id });
    throw new BadRequestError('OTP expired');
  }

  if (user.otpCode !== otp) {
    logger.warn('[AUTH:VERIFY-OTP] Invalid OTP', { userId: user.id });
    throw new BadRequestError('Invalid OTP');
  }

  logger.info('[AUTH:VERIFY-OTP] User verified successfully', { userId: user.id });

  const token = jwt.sign({ userId: user.id, role: 'CUSTOMER' }, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'secret', { expiresIn: '7d' });

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully. User is now active.',
    data: {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    },
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone } = req.body;
  logger.info('[AUTH:FORGOT-PASSWORD]', { email, phone });

  if (!email && !phone) {
    throw new BadRequestError('Email or Phone is required');
  }

  const resetToken = jwt.sign({ email: email || phone }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

  logger.info('[AUTH:FORGOT-PASSWORD] Reset token generated');

  res.status(200).json({
    success: true,
    message: 'Reset password link sent successfully',
    data: {
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  logger.info('[AUTH:RESET-PASSWORD]', { token });

  if (!token || !newPassword) {
    throw new BadRequestError('Token and New Password are required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { email: string; phone: string; };

    const passwordHash = await bcrypt.hash(newPassword, 10);

    logger.info('[AUTH:RESET-PASSWORD] Password reset successfully', { email: decoded.email });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    logger.error('[AUTH:RESET-PASSWORD] Invalid Token', { error });
    throw new UnauthorizedError('Invalid or Expired Token');
  }
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  logger.info('[AUTH:GET-ME]', { userId });

  const user = {
    id: userId,
    email: 'mock@bookyourservice.com',
    phone: '+919999999999',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    fullName: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  res.status(200).json({
    success: true,
    message: 'Profile fetched successfully',
    data: user,
  });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { fullName, avatarUrl, address, city, state, zipCode, country } = req.body;
  logger.info('[AUTH:UPDATE-ME]', { userId, body: req.body });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      userId,
      updates: {
        fullName,
        avatarUrl,
        address,
        city,
        state,
        zipCode,
        country,
      },
    },
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { oldPassword, newPassword } = req.body;
  logger.info('[AUTH:CHANGE-PASSWORD]', { userId });

  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Old Password and New Password are required');
  }

  const user = {
    id: userId,
    passwordHash: '$2a$10$GK2z...',
  };

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

  if (!isMatch) {
    logger.warn('[AUTH:CHANGE-PASSWORD] Old Password mismatch', { userId });
    throw new UnauthorizedError('Invalid Old Password');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  logger.info('[AUTH:CHANGE-PASSWORD] Password changed successfully', { userId });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  logger.info('[AUTH:DELETE-ME]', { userId });

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
    data: {
      userId,
      status: 'DELETED',
    },
  });
});
