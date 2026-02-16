import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Resolve a report (admin)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { adminId, reportId, action, adminNotes } = data
    
    if (!adminId || !reportId || !action) {
      return NextResponse.json(
        { error: 'Admin ID, Report ID, and action required' },
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
    
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: { reported: true }
    })
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }
    
    // Update report status
    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: {
        status: action === 'dismiss' ? 'DISMISSED' : 'RESOLVED',
        adminNotes: adminNotes || null
      }
    })
    
    // If action is to penalize (not dismiss), further reduce trust score
    if (action === 'penalize') {
      await db.user.update({
        where: { id: report.reportedId },
        data: {
          trustScore: { decrement: 20 },
          isFrozen: report.reported.trustScore <= 40 // Freeze if already low trust
        }
      })
    } else if (action === 'dismiss') {
      // Restore trust score if dismissed
      await db.user.update({
        where: { id: report.reportedId },
        data: {
          trustScore: { increment: 15 } // Restore the deducted amount
        }
      })
    }
    
    // Log activity
    await db.activityLog.create({
      data: {
        userId: adminId,
        action: `REPORT_${action.toUpperCase()}`,
        details: `Report ${reportId} ${action}${adminNotes ? `: ${adminNotes}` : ''}`
      }
    })
    
    return NextResponse.json({
      success: true,
      report: {
        id: updatedReport.id,
        status: updatedReport.status
      }
    })
  } catch (error) {
    console.error('Resolve report error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve report' },
      { status: 500 }
    )
  }
}
