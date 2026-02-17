'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'

interface WSMessage {
  type: string
  payload: any
  timestamp?: number
}

interface UseWebSocketReturn {
  isConnected: boolean
  sendMessage: (message: WSMessage) => void
  lastMessage: WSMessage | null
  connectionError: string | null
}

export function useWebSocket(): UseWebSocketReturn {
  const { user } = useAppStore()
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000 // 3 seconds

  const handleMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'CONNECTED':
        console.log('Connected to Help2Earn real-time service')
        break

      case 'USER_DATA':
        // Update user data in store if needed
        console.log('Received user data update')
        break

      case 'LOCATION_UPDATED':
        console.log('Location updated successfully')
        break

      case 'LOCATION_UPDATE_FAILED':
        console.error('Location update failed:', message.payload.error)
        break

      case 'TRUST_SCORE_CHANGED':
        console.log('Trust score changed:', message.payload)
        // Could trigger a toast notification here
        break

      case 'PAYMENT_UPDATED':
        console.log('Payment status updated:', message.payload)
        break

      case 'NEW_PROBLEM_NEARBY':
        console.log('New problem nearby:', message.payload.problem)
        // Could show a notification
        break

      case 'USER_TYPING':
        // Handle typing indicators
        break

      case 'USER_STOPPED_TYPING':
        // Handle typing indicators
        break

      case 'NOTIFICATIONS_MARKED_READ':
        console.log('Notifications marked as read')
        break

      default:
        console.log('Received WebSocket message:', message.type)
    }
  }, [])

  const connect = useCallback(() => {
    if (!user?.id || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    const attemptReconnect = () => {
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectDelay)
      } else {
        setConnectionError('Failed to reconnect to real-time service')
      }
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/ws?userId=${user.id}`

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttempts.current = 0
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          setLastMessage(message)

          // Handle specific message types
          handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        wsRef.current = null

        if (!event.wasClean) {
          attemptReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionError('Connection error')
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionError('Failed to connect')
    }
  }, [user?.id, handleMessage])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
    setLastMessage(null)
    setConnectionError(null)
  }, [])

  const sendMessage = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  // Connect when user is available
  useEffect(() => {
    if (user?.id && !isConnected) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [user?.id, connect, disconnect, isConnected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    sendMessage,
    lastMessage,
    connectionError
  }
}

// Hook for location updates
export function useLocationUpdates() {
  const { sendMessage } = useWebSocket()

  const updateLocation = useCallback((latitude: number, longitude: number, locationText?: string) => {
    sendMessage({
      type: 'LOCATION_UPDATE',
      payload: {
        latitude,
        longitude,
        locationText
      }
    })
  }, [sendMessage])

  return { updateLocation }
}

// Hook for typing indicators
export function useTypingIndicator(problemId: string, targetUserId: string) {
  const { sendMessage } = useWebSocket()

  const startTyping = useCallback(() => {
    sendMessage({
      type: 'TYPING_START',
      payload: {
        problemId,
        targetUserId
      }
    })
  }, [sendMessage, problemId, targetUserId])

  const stopTyping = useCallback(() => {
    sendMessage({
      type: 'TYPING_STOP',
      payload: {
        problemId,
        targetUserId
      }
    })
  }, [sendMessage, problemId, targetUserId])

  return { startTyping, stopTyping }
}

// Hook for marking notifications as read
export function useNotificationManager() {
  const { sendMessage } = useWebSocket()

  const markAsRead = useCallback((notificationIds: string[]) => {
    sendMessage({
      type: 'MARK_NOTIFICATIONS_READ',
      payload: {
        notificationIds
      }
    })
  }, [sendMessage])

  return { markAsRead }
}
