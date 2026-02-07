// Production-grade logout API
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { deleteSession } from '@/lib/api/auth';
import { successResponse, handleApiError } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.replace('Bearer ', '');

    if (token) {
      await deleteSession(token);
    }

    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
