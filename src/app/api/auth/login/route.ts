// Production-grade login API
import { NextRequest } from 'next/server';
import { authenticateUser } from '@/lib/api/auth';
import { successResponse, unauthorizedResponse, handleApiError } from '@/lib/api/response';
import { isValidEmail, sanitizeInput } from '@/lib/api/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.email || !isValidEmail(body.email)) {
      return unauthorizedResponse('Invalid email address');
    }

    if (!body.password) {
      return unauthorizedResponse('Password is required');
    }

    // Authenticate user
    const result = await authenticateUser(
      sanitizeInput(body.email.toLowerCase()),
      body.password
    );

    if (!result) {
      return unauthorizedResponse('Invalid email or password');
    }

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
