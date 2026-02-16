import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get all reports (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')
    const status = searchParams.get('status') || 'PENDING'
    
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
    
    const reports = await db.report.findMany({
      where,
      include: {
        reporter: { 
          select: { id: true, phone: true, name: true, trustScore: true, paymentActive: true } 
        },
        reported: { 
          select: { id: true, phone: true, name: true, trustScore: true, paymentActive: true } 
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    
    return NextResponse.json({
      reports: reports.map(r => ({
        id: r.id,
        reporterId: r.reporterId,
        reportedId: r.reportedId,
        problemId: r.problemId,
        reason: r.reason,
        category: r.category,
        status: r.status,
        adminNotes: r.adminNotes,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        reporter: r.reporter,
        reported: r.reported
      })),
      total: reports.length
    })
  } catch (error) {
    console.error('Get admin reports error:', error)
    return NextResponse.json(
      { error: 'Failed to get reports' },
      { status: 500 }
    )
  }
}
