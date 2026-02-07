// Production-grade authentication middleware and utilities

import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { verifyPassword, generateToken } from './crypto';
import { unauthorizedResponse, forbiddenResponse, handleApiError } from './response';
import { UserInfo } from './types';

const SESSION_EXPIRY_HOURS = 24 * 7; // 7 days

export interface AuthContext {
  user: UserInfo;
}

// Get session from request headers
export async function getSession(): Promise<AuthContext | null> {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Find session in database
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { id: session.id } });
      return null;
    }

    // Check if user is active
    if (session.user.status !== 'ACTIVE') {
      return null;
    }

    // Update last login
    await db.user.update({
      where: { id: session.user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        phone: session.user.phone,
        avatar: session.user.avatar,
        role: session.user.role as any,
        status: session.user.status as any,
        emailVerified: session.user.emailVerified,
        city: session.user.city,
        trustScore: session.user.trustScore,
      },
    };
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

// Require authentication
export async function requireAuth(): Promise<AuthContext> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

// Require specific role
export async function requireRole(...roles: string[]): Promise<AuthContext> {
  const auth = await requireAuth();

  if (!roles.includes(auth.user.role)) {
    throw new Error('Forbidden');
  }

  return auth;
}

// Check if user is admin
export async function requireAdmin(): Promise<AuthContext> {
  return requireRole('ADMIN');
}

// Check if user is provider or admin
export async function requireProviderOrAdmin(): Promise<AuthContext> {
  return requireRole('PROVIDER', 'ADMIN');
}

// Verify credentials and create session
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: UserInfo; token: string } | null> {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    if (!await verifyPassword(password, user.passwordHash)) {
      return null;
    }

    if (user.status !== 'ACTIVE') {
      return null;
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role as any,
        status: user.status as any,
        emailVerified: user.emailVerified,
        city: user.city,
        trustScore: user.trustScore,
      },
      token,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Delete session (logout)
export async function deleteSession(token: string): Promise<void> {
  try {
    await db.session.delete({
      where: { token },
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Delete all user sessions
export async function deleteAllUserSessions(userId: string): Promise<void> {
  try {
    await db.session.deleteMany({
      where: { userId },
    });
  } catch (error) {
    console.error('Delete sessions error:', error);
  }
}
