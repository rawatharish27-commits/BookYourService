import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Admin action on user
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { adminId, targetUserId, action, value } = data
    
    if (!adminId || !targetUserId || !action) {
      return NextResponse.json(
        { error: 'Admin ID, Target User ID, and action required' },
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
    
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId }
    })
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    let updateData: Record<string, unknown> = {}
    
    switch (action) {
      case 'freeze':
        updateData.isFrozen = true
        break
      case 'unfreeze':
        updateData.isFrozen = false
        break
      case 'activate':
        updateData.paymentActive = true
        updateData.activeTill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        break
      case 'deactivate':
        updateData.paymentActive = false
        updateData.activeTill = null
        break
      case 'setTrust':
        if (typeof value !== 'number' || value < 0 || value > 100) {
          return NextResponse.json(
            { error: 'Trust value must be 0-100' },
            { status: 400 }
          )
        }
        updateData.trustScore = value
        break
      case 'adjustTrust':
        if (typeof value !== 'number') {
          return NextResponse.json(
            { error: 'Trust adjustment value required' },
            { status: 400 }
          )
        }
        const newScore = Math.max(0, Math.min(100, targetUser.trustScore + value))
        updateData.trustScore = newScore
        break
      case 'makeAdmin':
        updateData.isAdmin = true
        break
      case 'removeAdmin':
        updateData.isAdmin = false
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: updateData
    })
    
    // Log activity
    await db.activityLog.create({
      data: {
        userId: adminId,
        action: `USER_${action.toUpperCase()}`,
        details: `User ${targetUserId}: ${action}${value !== undefined ? ` (${value})` : ''}`
      }
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        name: updatedUser.name,
        trustScore: updatedUser.trustScore,
        paymentActive: updatedUser.paymentActive,
        activeTill: updatedUser.activeTill?.toISOString() || null,
        isAdmin: updatedUser.isAdmin,
        isFrozen: updatedUser.isFrozen
      }
    })
  } catch (error) {
    console.error('User action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}
