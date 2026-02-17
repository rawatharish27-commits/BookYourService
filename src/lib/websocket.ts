import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { db } from './db'
import { logger } from './logger'
import { trustScoreManager } from './trust-score'
import { locationValidator } from './location-validator'
import { deviceFingerprintManager } from './device-fingerprint'

interface WSClient {
  ws: WebSocket
  userId: string
  isAlive: boolean
  lastPing: number
}

interface WSMessage {
  type: string
  payload: any
  timestamp?: number
}

class WebSocketManager {
  private wss: WebSocketServer | null = null
  private clients: Map<string, WSClient> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null

  // Initialize WebSocket server
  init(server: any) {
    this.wss = new WebSocketServer({
      server,
      path: '/api/ws',
      perMessageDeflate: false
    })

    this.wss.on('connection', this.handleConnection.bind(this))

    // Start heartbeat to detect dead connections
    this.startHeartbeat()

    logger.info('WebSocket server initialized')
  }

  private async handleConnection(ws: WebSocket, request: IncomingMessage) {
    try {
      // Extract user ID from query parameters or headers
      const url = new URL(request.url || '', 'http://localhost')
      const userId = url.searchParams.get('userId') || request.headers['x-user-id'] as string

      if (!userId) {
        ws.close(4001, 'User ID required')
        return
      }

      // Verify user exists
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, isFrozen: true }
      })

      if (!user) {
        ws.close(4002, 'User not found')
        return
      }

      if (user.isFrozen) {
        ws.close(4003, 'Account frozen')
        return
      }

      // Register client
      const client: WSClient = {
        ws,
        userId,
        isAlive: true,
        lastPing: Date.now()
      }

      this.clients.set(userId, client)

      // Set up event handlers
      ws.on('message', (data) => this.handleMessage(userId, data))
      ws.on('pong', () => {
        client.isAlive = true
        client.lastPing = Date.now()
      })
      ws.on('close', () => this.handleDisconnect(userId))
      ws.on('error', (error) => this.handleError(userId, error))

      // Send welcome message
      this.sendToUser(userId, {
        type: 'CONNECTED',
        payload: {
          message: 'Connected to Help2Earn real-time service'
        },
        timestamp: Date.now()
      })

      // Send initial user data
      await this.sendUserData(userId)

      logger.info('WebSocket client connected', { userId })

    } catch (error) {
      logger.error('WebSocket connection error:', {
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      ws.close(4000, 'Connection failed')
    }
  }

  private async handleMessage(userId: string, data: Buffer) {
    try {
      const message: WSMessage = JSON.parse(data.toString())

      switch (message.type) {
        case 'PING':
          this.sendToUser(userId, {
            type: 'PONG',
            payload: {},
            timestamp: Date.now()
          })
          break

        case 'LOCATION_UPDATE':
          await this.handleLocationUpdate(userId, message.payload)
          break

        case 'TYPING_START':
          await this.handleTypingIndicator(userId, message.payload, true)
          break

        case 'TYPING_STOP':
          await this.handleTypingIndicator(userId, message.payload, false)
          break

        case 'MARK_NOTIFICATIONS_READ':
          await this.handleMarkNotificationsRead(userId, message.payload)
          break

        default:
          logger.warn('Unknown WebSocket message type', {
            userId,
            metadata: { type: message.type }
          })
      }
    } catch (error) {
      logger.error('WebSocket message handling error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }
  }

  private handleDisconnect(userId: string) {
    this.clients.delete(userId)
    logger.info('WebSocket client disconnected', { userId })
  }

  private handleError(userId: string, error: Error) {
    logger.error('WebSocket error:', {
      userId,
      metadata: { error: error.message }
    })
    this.clients.delete(userId)
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, userId) => {
        if (!client.isAlive) {
          client.ws.terminate()
          this.clients.delete(userId)
          return
        }

        client.isAlive = false
        client.ws.ping()
      })
    }, 30000) // 30 seconds
  }

  // Send message to specific user
  sendToUser(userId: string, message: WSMessage) {
    const client = this.clients.get(userId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
    }
  }

  // Broadcast to all connected users
  broadcast(message: WSMessage, excludeUserId?: string) {
    this.clients.forEach((client, userId) => {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, message)
      }
    })
  }

  // Send to multiple users
  sendToUsers(userIds: string[], message: WSMessage) {
    userIds.forEach(userId => this.sendToUser(userId, message))
  }

  // Handle location updates
  private async handleLocationUpdate(userId: string, payload: any) {
    try {
      const { latitude, longitude, locationText } = payload

      // Validate location
      const validation = await locationValidator.validateLocationUpdate(
        userId,
        latitude,
        longitude
      )

      if (!validation.isValid) {
        this.sendToUser(userId, {
          type: 'LOCATION_UPDATE_FAILED',
          payload: {
            error: validation.reasons?.join(', ') || 'Invalid location'
          },
          timestamp: Date.now()
        })
        return
      }

      // Update user location
      await db.user.update({
        where: { id: userId },
        data: {
          latitude,
          longitude,
          locationText,
          lastActiveAt: new Date()
        }
      })

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          action: 'LOCATION_UPDATE',
          details: JSON.stringify({
            latitude,
            longitude,
            locationText,
            validated: true
          })
        }
      })

      this.sendToUser(userId, {
        type: 'LOCATION_UPDATED',
        payload: {
          latitude,
          longitude,
          locationText
        },
        timestamp: Date.now()
      })

    } catch (error) {
      logger.error('Location update error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }
  }

  // Handle typing indicators
  private async handleTypingIndicator(userId: string, payload: any, isTyping: boolean) {
    const { problemId, targetUserId } = payload

    if (targetUserId) {
      this.sendToUser(targetUserId, {
        type: isTyping ? 'USER_TYPING' : 'USER_STOPPED_TYPING',
        payload: {
          userId,
          problemId
        },
        timestamp: Date.now()
      })
    }
  }

  // Handle marking notifications as read
  private async handleMarkNotificationsRead(userId: string, payload: any) {
    const { notificationIds } = payload

    await db.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId
      },
      data: { read: true }
    })

    this.sendToUser(userId, {
      type: 'NOTIFICATIONS_MARKED_READ',
      payload: {
        notificationIds
      },
      timestamp: Date.now()
    })
  }

  // Send initial user data
  private async sendUserData(userId: string) {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          phone: true,
          name: true,
          trustScore: true,
          paymentActive: true,
          activeTill: true,
          latitude: true,
          longitude: true,
          locationText: true,
          isFrozen: true,
          totalHelpsGiven: true,
          totalHelpsTaken: true
        }
      })

      if (user) {
        this.sendToUser(userId, {
          type: 'USER_DATA',
          payload: user,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      logger.error('Send user data error:', {
        userId,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    }
  }

  // Notify about new problems in user's area
  async notifyNearbyUsersOfNewProblem(problem: any, userLocation: { lat: number; lng: number }) {
    // Find users within 20km who have notifications enabled
    const nearbyUsers = await db.user.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        notifyNewRequests: true,
        isFrozen: false,
        paymentActive: true
      },
      select: { id: true, latitude: true, longitude: true }
    })

    const nearbyUserIds: string[] = []

    nearbyUsers.forEach(user => {
      if (user.latitude && user.longitude) {
        const distance = this.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          user.latitude,
          user.longitude
        )

        if (distance <= 20) { // 20km radius
          nearbyUserIds.push(user.id)
        }
      }
    })

    if (nearbyUserIds.length > 0) {
      this.sendToUsers(nearbyUserIds, {
        type: 'NEW_PROBLEM_NEARBY',
        payload: {
          problem: {
            id: problem.id,
            title: problem.title,
            category: problem.category,
            offerPrice: problem.offerPrice,
            distance: 0, // Will be calculated client-side
            createdAt: problem.createdAt
          }
        },
        timestamp: Date.now()
      })
    }
  }

  // Notify about trust score changes
  async notifyTrustScoreChange(userId: string, oldScore: number, newScore: number, reason: string) {
    this.sendToUser(userId, {
      type: 'TRUST_SCORE_CHANGED',
      payload: {
        oldScore,
        newScore,
        change: newScore - oldScore,
        reason
      },
      timestamp: Date.now()
    })
  }

  // Notify about payment status changes
  async notifyPaymentUpdate(userId: string, payment: any) {
    this.sendToUser(userId, {
      type: 'PAYMENT_UPDATED',
      payload: {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount
      },
      timestamp: Date.now()
    })
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  // Cleanup
  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    if (this.wss) {
      this.wss.close()
    }

    this.clients.clear()
    logger.info('WebSocket manager destroyed')
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager()
