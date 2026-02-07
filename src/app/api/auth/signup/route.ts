// Production-grade signup API
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/api/crypto';
import { successResponse, badRequestResponse, conflictResponse, handleApiError } from '@/lib/api/response';
import { isValidEmail, validatePassword, sanitizeInput } from '@/lib/api/validation';
import { SignupInput } from '@/lib/api/types';

export async function POST(request: NextRequest) {
  try {
    const body: SignupInput = await request.json();

    // Validate input
    const validationErrors: Record<string, string> = {};

    if (!body.email || !isValidEmail(body.email)) {
      validationErrors.email = 'Invalid email address';
    }

    if (!body.password) {
      validationErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(body.password);
      if (!passwordValidation.isValid) {
        validationErrors.password = passwordValidation.errors[0].message;
      }
    }

    if (!body.name || body.name.trim().length < 2) {
      validationErrors.name = 'Name must be at least 2 characters';
    }

    if (body.phone && !/^[6-9]\d{9}$/.test(body.phone)) {
      validationErrors.phone = 'Invalid phone number (must be 10 digits)';
    }

    if (body.role && !['CLIENT', 'PROVIDER'].includes(body.role)) {
      validationErrors.role = 'Invalid role';
    }

    if (Object.keys(validationErrors).length > 0) {
      return badRequestResponse(JSON.stringify(validationErrors));
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existingUser) {
      return conflictResponse('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(body.password);

    // Create user
    const user = await db.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        name: sanitizeInput(body.name),
        phone: body.phone ? sanitizeInput(body.phone) : null,
        role: body.role || 'CLIENT',
        status: 'ACTIVE',
        emailVerified: false,
        trustScore: 5.0,
      },
    });

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      city: user.city,
      trustScore: user.trustScore,
    };

    return successResponse(userData);
  } catch (error) {
    return handleApiError(error);
  }
}
