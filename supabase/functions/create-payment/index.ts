/**
 * Supabase Edge Function: Create Payment Order
 * 
 * This function creates a payment order with Razorpay/Stripe.
 * It NEVER processes payment in frontend - all logic is server-side.
 * 
 * Flow:
 * 1. Frontend calls this Edge Function with bookingId and amount
 * 2. This function creates order with Razorpay/Stripe
 * 3. Returns order details to frontend
 * 4. Frontend opens payment popup
 * 5. Payment success webhook hits payment-webhook function
 * 
 * Security:
 * - Razorpay key/secret stored as Supabase secrets (never in frontend)
 * - Booking validated before creating order
 * - Amount validated (no tampering from frontend)
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

// Type definitions
interface CreatePaymentRequest {
  bookingId: string;
  amount: number;
  currency?: string;
  gateway?: 'razorpay' | 'stripe';
}

interface CreatePaymentResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
  message?: string;
}

interface BookingDetails {
  id: string;
  customer_id: string;
  service: string;
  total_amount: number;
  status: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Parse request body
    const body: CreatePaymentRequest = await req.json();
    const { bookingId, amount, currency = 'INR', gateway = 'razorpay' } = body;

    // Validate required fields
    if (!bookingId || !amount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: bookingId and amount' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get payment gateway credentials from environment
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    // Validate payment gateway credentials
    if (gateway === 'razorpay' && (!razorpayKeyId || !razorpayKeySecret)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment gateway not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch booking details from Supabase to validate
    const bookingResponse = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
    });

    const bookingData = await bookingResponse.json();
    const bookings: BookingDetails[] = bookingData || [];

    // Validate booking exists
    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Booking not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const booking = bookings[0];

    // Validate booking status (only allow payment for requested/accepted bookings)
    if (booking.status !== 'requested' && booking.status !== 'accepted') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Cannot create payment for booking with status: ${booking.status}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate amount (prevent tampering - use booking amount or provided amount, whichever is validated)
    const finalAmount = booking.total_amount || amount;

    if (finalAmount <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid amount' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create payment order based on gateway
    let orderResponse: CreatePaymentResponse;

    if (gateway === 'razorpay') {
      // Razorpay Order Creation
      const razorpayOrder = await createRazorpayOrder(
        bookingId,
        finalAmount,
        currency,
        razorpayKeyId,
        razorpayKeySecret!
      );
      orderResponse = razorpayOrder;
    } else if (gateway === 'stripe') {
      // Stripe Payment Intent Creation
      const stripePayment = await createStripePaymentIntent(
        bookingId,
        finalAmount,
        currency,
        stripeSecretKey!
      );
      orderResponse = stripePayment;
    } else {
      orderResponse = {
        success: false,
        error: 'Invalid payment gateway specified'
      };
    }

    // Log payment creation attempt to database (audit log)
    if (orderResponse.success) {
      await logPaymentCreation(
        supabaseUrl,
        supabaseServiceKey,
        bookingId,
        orderResponse.orderId!,
        finalAmount,
        gateway
      );
    }

    return new Response(
      JSON.stringify(orderResponse),
      { 
        status: orderResponse.success ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Payment creation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Create Razorpay Order
 * 
 * @param bookingId - Booking ID for receipt
 * @param amount - Amount in INR
 * @param currency - Currency code
 * @param keyId - Razorpay Key ID
 * @param keySecret - Razorpay Key Secret
 * @returns Razorpay order response
 */
async function createRazorpayOrder(
  bookingId: string,
  amount: number,
  currency: string,
  keyId: string,
  keySecret: string
): Promise<CreatePaymentResponse> {
  try {
    const auth = btoa(`${keyId}:${keySecret}`);

    const orderRequest = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: bookingId,
      payment_capture: 1, // Auto-capture payment
      notes: {
        booking_id: bookingId,
        gateway: 'razorpay'
      }
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(orderRequest)
    });

    const order = await response.json();

    if (!response.ok || !order.id) {
      return {
        success: false,
        error: order.error?.description || 'Failed to create Razorpay order'
      };
    }

    return {
      success: true,
      orderId: order.id,
      amount: order.amount / 100, // Convert back to rupees
      currency: order.currency,
      keyId: keyId
    };

  } catch (error: any) {
    return {
      success: false,
      error: 'Razorpay API error',
      message: error.message
    };
  }
}

/**
 * Create Stripe Payment Intent
 * 
 * @param bookingId - Booking ID
 * @param amount - Amount in smallest currency unit (paise for INR, cents for USD)
 * @param currency - Currency code
 * @param secretKey - Stripe Secret Key
 * @returns Stripe payment response
 */
async function createStripePaymentIntent(
  bookingId: string,
  amount: number,
  currency: string,
  secretKey: string
): Promise<CreatePaymentResponse> {
  try {
    const paymentIntentRequest = {
      amount: amount * 100, // Stripe expects amount in smallest currency unit
      currency: currency.toLowerCase(),
      metadata: {
        booking_id: bookingId,
        gateway: 'stripe'
      },
      payment_method_types: ['card'],
      capture_method: 'automatic' // Auto-capture payment
    };

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`
      },
      body: JSON.stringify(paymentIntentRequest)
    });

    const paymentIntent = await response.json();

    if (!response.ok || !paymentIntent.id) {
      return {
        success: false,
        error: paymentIntent.error?.message || 'Failed to create Stripe payment intent'
      };
    }

    return {
      success: true,
      orderId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase()
    };

  } catch (error: any) {
    return {
      success: false,
      error: 'Stripe API error',
      message: error.message
    };
  }
}

/**
 * Log Payment Creation to Database (Audit)
 * 
 * @param supabaseUrl - Supabase project URL
 * @param serviceKey - Supabase service role key
 * @param bookingId - Booking ID
 * @param orderId - Payment order ID
 * @param amount - Payment amount
 * @param gateway - Payment gateway used
 */
async function logPaymentCreation(
  supabaseUrl: string,
  serviceKey: string,
  bookingId: string,
  orderId: string,
  amount: number,
  gateway: string
): Promise<void> {
  try {
    // Create payment record with 'pending' status
    const paymentRecord = {
      booking_id: bookingId,
      order_id: orderId,
      amount: amount,
      gateway: gateway,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/payments`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(paymentRecord)
    });

    console.log(`Payment order created: ${orderId} for booking: ${bookingId}`);

  } catch (error) {
    console.error('Failed to log payment creation:', error);
  }
}
