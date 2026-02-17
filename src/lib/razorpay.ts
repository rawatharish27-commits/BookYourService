// Razorpay Payment Integration
import { loadScript } from '@/lib/script-loader'

export interface PaymentOptions {
  amount: number
  currency: string
  name: string
  description?: string
  orderId?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
}

export interface PaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export class RazorpayService {
  private static instance: RazorpayService
  private razorpayKey: string
  private isLoaded = false

  private constructor() {
    this.razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
    if (!this.razorpayKey) {
      console.warn('Razorpay key not configured')
    }
  }

  static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService()
    }
    return RazorpayService.instance
  }

  async loadRazorpay(): Promise<boolean> {
    if (this.isLoaded) return true

    if (typeof window === 'undefined') return false

    try {
      const script = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      this.isLoaded = true
      return true
    } catch (error) {
      console.error('Failed to load Razorpay script:', error)
      return false
    }
  }

  async createOrder(amount: number, currency = 'INR'): Promise<any> {
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paisa
          currency,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()
      return order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  async initiatePayment(options: PaymentOptions): Promise<PaymentResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        // Load Razorpay if not already loaded
        const loaded = await this.loadRazorpay()
        if (!loaded) {
          throw new Error('Failed to load Razorpay')
        }

        // Create order if not provided
        let orderId = options.orderId
        if (!orderId) {
          const order = await this.createOrder(options.amount, options.currency)
          orderId = order.id
        }

        // Razorpay options
        const razorpayOptions = {
          key: this.razorpayKey,
          amount: options.amount * 100, // Convert to paisa
          currency: options.currency,
          name: options.name,
          description: options.description,
          order_id: orderId,
          prefill: options.prefill,
          notes: options.notes,
          theme: options.theme || { color: '#10b981' },
          handler: (response: PaymentResponse) => {
            resolve(response)
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'))
            },
          },
        }

        // Create Razorpay instance
        const rzp = new (window as any).Razorpay(razorpayOptions)

        // Handle payment failure
        rzp.on('payment.failed', (response: any) => {
          reject(new Error(response.error.description || 'Payment failed'))
        })

        // Open payment modal
        rzp.open()

      } catch (error) {
        reject(error)
      }
    })
  }

  async verifyPayment(paymentResponse: PaymentResponse): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentResponse),
      })

      if (!response.ok) {
        throw new Error('Payment verification failed')
      }

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Error verifying payment:', error)
      return false
    }
  }

  async createSubscription(planId: string, options: {
    customerName?: string
    customerEmail?: string
    customerContact?: string
  } = {}): Promise<any> {
    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      const subscription = await response.json()
      return subscription
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      return true
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return false
    }
  }

  // UPI Payment Methods
  async getUPIMethods(): Promise<string[]> {
    // In production, this would fetch from Razorpay API
    return [
      'paytm',
      'phonepe',
      'googlepay',
      'bhim',
      'amazonpay',
      'whatsapp',
      'other'
    ]
  }

  async initiateUPIPayment(amount: number, upiId: string): Promise<string> {
    try {
      const response = await fetch('/api/payments/upi-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100,
          upiId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to initiate UPI payment')
      }

      const result = await response.json()
      return result.upiUrl
    } catch (error) {
      console.error('Error initiating UPI payment:', error)
      throw error
    }
  }

  // Utility methods
  formatAmount(amount: number, currency = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  validateUPID(upiId: string): boolean {
    // Basic UPI ID validation
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/
    return upiRegex.test(upiId)
  }
}

// Export singleton instance
export const razorpayService = RazorpayService.getInstance()

// Type declarations for Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}
