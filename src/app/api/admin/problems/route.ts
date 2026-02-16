import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get all problems (admin view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')
    const status = searchParams.get('status') || 'ALL'
    const type = searchParams.get('type')
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
    
    const where: Record<string, unknown> = {}
    
    if (status !== 'ALL') {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    const total = await db.problem.count({ where })
    
    const problems = await db.problem.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            trustScore: true,
            paymentActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })
    
    return NextResponse.json({
      problems: problems.map(p => ({
        id: p.id,
        userId: p.userId,
        type: p.type,
        riskLevel: p.riskLevel,
        category: p.category,
        title: p.title,
        description: p.description,
        offerPrice: p.offerPrice,
        latitude: p.latitude,
        longitude: p.longitude,
        locationText: p.locationText,
        minTrustRequired: p.minTrustRequired,
        status: p.status,
        viewCount: p.viewCount,
        callCount: p.callCount,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        expiresAt: p.expiresAt?.toISOString() || null,
        user: p.user
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Get admin problems error:', error)
    return NextResponse.json(
      { error: 'Failed to get problems' },
      { status: 500 }
    )
  }
}
