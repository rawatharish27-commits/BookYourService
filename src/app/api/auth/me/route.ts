// Production-grade get current user API
import { getSession } from '@/lib/api/auth';
import { successResponse, unauthorizedResponse, handleApiError } from '@/lib/api/response';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return unauthorizedResponse();
    }

    return successResponse(session.user);
  } catch (error) {
    return handleApiError(error);
  }
}
