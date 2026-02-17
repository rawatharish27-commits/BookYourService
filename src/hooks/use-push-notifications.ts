'use client'

import { useState, useEffect } from 'react'
import { swManager } from '@/lib/service-worker'

export interface PushNotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  data?: any
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    // Check if push notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true)
      setPermission(Notification.permission)

      // Get existing subscription
      getCurrentSubscription()
    }
  }, [])

  const getCurrentSubscription = async () => {
    try {
      const registration = swManager.getRegistration()
      if (registration) {
        const existingSubscription = await registration.pushManager.getSubscription()
        setSubscription(existingSubscription)
      }
    } catch (error) {
      console.error('Error getting subscription:', error)
    }
  }

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Push notifications not supported')
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Error requesting permission:', error)
      return 'denied'
    }
  }

  const subscribe = async (vapidPublicKey?: string): Promise<PushSubscription | null> => {
    if (!isSupported || permission !== 'granted') {
      throw new Error('Permission not granted or not supported')
    }

    try {
      const registration = swManager.getRegistration()
      if (!registration) {
        throw new Error('Service worker not registered')
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true
      })

      setSubscription(newSubscription)

      // Send subscription to server
      await sendSubscriptionToServer(newSubscription)

      return newSubscription
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return null
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) return true

    try {
      const result = await subscription.unsubscribe()
      if (result) {
        setSubscription(null)
        await removeSubscriptionFromServer(subscription)
      }
      return result
    } catch (error) {
      console.error('Error unsubscribing:', error)
      return false
    }
  }

  const sendNotification = async (data: PushNotificationData) => {
    if (permission !== 'granted') {
      throw new Error('Permission not granted')
    }

    try {
      await swManager.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/logo.png',
        badge: data.badge || '/logo.png',
        data: data.data,
        tag: data.url || 'default'
      })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send subscription to server')
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error)
    }
  }

  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server')
      }
    } catch (error) {
      console.error('Error removing subscription from server:', error)
    }
  }

  return {
    permission,
    isSupported,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification,
    isSubscribed: !!subscription
  }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
