import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { locationPrivacyManager } from '@/lib/location-privacy'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await locationPrivacyManager.getPrivacySettings(auth.user.id)

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    logger.error('Get location settings error:', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { locationEnabled, foregroundOnly, shareWithHelpers, shareWithClients } = body

    const updatedSettings = await locationPrivacyManager.updateSettings(auth.user.id, {
      locationEnabled,
      foregroundOnly,
      shareWithHelpers,
      shareWithClients
    })

    return NextResponse.json({
      success: true,
      settings: updatedSettings
    })
  } catch (error) {
    logger.error('Update location settings error:', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await locationPrivacyManager.clearLocationData(auth.user.id)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Location data cleared successfully'
      })
    } else {
      return NextResponse.json({ error: 'Failed to clear location data' }, { status: 500 })
    }
  } catch (error) {
    logger.error('Clear location data error:', {
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
