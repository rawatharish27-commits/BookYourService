import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get activity logs (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID required' },
        { status: 400 }
      )
    }
    
    const admin = await db.user.findUnique({
      where: { id: adminId }
    })
    
    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }
    
    const total = await db.activityLog.count()
    
    const logs = await db.activityLog.findMany({
      include: {
        user: {
          select: { id: true, phone: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })
    
    return NextResponse.json({
      logs: logs.map(l => ({
        id: l.id,
        userId: l.userId,
        action: l.action,
        details: l.details,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt.toISOString(),
        user: l.user
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Get activity logs error:', error)
    return NextResponse.json(
      { error: 'Failed to get activity logs' },
      { status: 500 }
    )
  }
}
