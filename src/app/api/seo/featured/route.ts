import { NextResponse } from 'next/server';

// API endpoint for featured services
export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookyourservice.com';
    const searchParams = request.nextUrl.searchParams;
    
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Fetch featured services from database
    const response = await fetch(`${baseUrl}/api/services?featured=true&limit=${limit}`);
    const data = await response.json();
    
    if (data.success) {
      const services = data.data || [];
      return NextResponse.json({
        success: true,
        data: {
          services,
          total: services.length,
          page: searchParams.get('page') || '1',
          limit: limit,
          hasMore: services.length > parseInt(searchParams.get('limit') || '10')
        },
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'FEATURED_SERVICES_FETCH_FAILED',
        message: 'Failed to fetch featured services',
      },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'FEATURED_SERVICES_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// POST endpoint for admin to toggle featured status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, featured } = body;
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bookyourservice.com';
    
    // Check admin permission
    const authResponse = await fetch(`${baseUrl}/api/auth/me`);
    const authData = await authResponse.json();
    
    if (!authData.success || authData.data.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Admin access required',
        },
        { status: 403 }
      );
    }
    
    const response = await fetch(`${baseUrl}/api/services/${serviceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.data.token || ''}`,
      },
      body: JSON.stringify({ featured }),
    });
    const data = await response.json();
    
    if (data.success) {
      return NextResponse.json({ success: true, data: data.data });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'FEATURED_TOGGLE_FAILED',
        message: 'Failed to update featured status',
      },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'FEATURED_SERVICES_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
