/**
 * Supabase Edge Function: Payment Webhook Handler
 * 
 * This function handles payment webhooks from Razorpay/Stripe.
 * It verifies the webhook signature to prevent tampering.
 * 
 * Flow:
 * 1. Razorpay/Stripe sends webhook on payment event
 * 2. This function verifies the signature (CRITICAL for security)
 * 3. On verified success: Update booking to 'completed', payment to 'paid'
 * 4. On verified failure: Update payment to 'failed', booking to 'cancelled'
 * 
 * Security:
 * - Webhook signature verification (MANDATORY)
 * - Only verified webhooks update database
 * - No frontend can trigger webhook processing
 * - Uses Supabase service role for database updates
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createHmac } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

// Type definitions
interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        notes: {
          booking_id: string;
          gateway: string;
        };
        created_at: number;
      };
    };
  };
}

interface StripeWebhookPayload {
  type: string;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata: {
        booking_id: string;
        gateway: string;
      };
      payment_intent: string;
    };
  };
}

// CORS headers for webhook response
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature, x-stripe-signature',
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
    // Get webhook signature from headers
    const razorpaySignature = req.headers.get('x-razorpay-signature');
    const stripeSignature = req.headers.get('x-stripe-signature');

    // Read raw request body for signature verification
    const rawBody = await req.text();

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get gateway secrets
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    // Process Razorpay webhook
    if (razorpaySignature && razorpayKeySecret) {
      return await processRazorpayWebhook(
        rawBody,
        razorpaySignature,
        razorpayKeySecret,
        supabaseUrl,
        supabaseServiceKey
      );
    }

    // Process Stripe webhook
    if (stripeSignature && stripeWebhookSecret) {
      return await processStripeWebhook(
        rawBody,
        stripeSignature,
        stripeWebhookSecret,
        supabaseUrl,
        supabaseServiceKey
      );
    }

    // Unknown gateway
    return new Response(
      JSON.stringify({ success: false, error: 'Unknown payment gateway' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Webhook processing failed',
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
 * Process Razorpay Webhook
 * 
 * @param rawBody - Raw request body for signature verification
 * @param signature - Razorpay webhook signature
 * @param keySecret - Razorpay key secret for verification
 * @param supabaseUrl - Supabase project URL
 * @param serviceKey - Supabase service role key
 */
async function processRazorpayWebhook(
  rawBody: string,
  signature: string,
  keySecret: string,
  supabaseUrl: string,
  serviceKey: string
): Promise<Response> {
  try {
    // Verify Razorpay webhook signature (SECURITY CRITICAL)
    const body = JSON.parse(rawBody);
    const webhookSecret = keySecret;

    // Razorpay signature: HMAC SHA256 of (webhook_secret + "|" + rawBody)
    const expectedSignature = await createHmac(
      'SHA-256',
      new TextEncoder().encode(webhookSecret + '|' + rawBody),
      { key: await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )}
    )
    ).then(sig => Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''));

    if (signature !== expectedSignature) {
      console.error('Razorpay webhook signature verification failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid signature' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const payload: RazorpayWebhookPayload = body;

    // Process different Razorpay events
    switch (payload.event) {
      case 'payment.captured':
      case 'payment.authorized':
        // Payment successful
        const payment = payload.payload.payment.entity;
        const bookingId = payment.notes.booking_id;

        await processSuccessfulPayment(
          supabaseUrl,
          serviceKey,
          bookingId,
          payment.id,
          payment.amount / 100, // Convert from paise to rupees
          payment.currency,
          'razorpay',
          'captured'
        );
        break;

      case 'payment.failed':
        // Payment failed
        const failedPayment = payload.payload.payment.entity;
        const failedBookingId = failedPayment.notes.booking_id;

        await processFailedPayment(
          supabaseUrl,
          serviceKey,
          failedBookingId,
          failedPayment.id,
          'razorpay',
          'failed'
        );
        break;

      default:
        console.log(`Unhandled Razorpay event: ${payload.event}`);
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('Razorpay webhook error:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: 'Webhook processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Process Stripe Webhook
 * 
 * @param rawBody - Raw request body for signature verification
 * @param signature - Stripe webhook signature
 * @param webhookSecret - Stripe webhook secret for verification
 * @param supabaseUrl - Supabase project URL
 * @param serviceKey - Supabase service role key
 */
async function processStripeWebhook(
  rawBody: string,
  signature: string,
  webhookSecret: string,
  supabaseUrl: string,
  serviceKey: string
): Promise<Response> {
  try {
    // Verify Stripe webhook signature (SECURITY CRITICAL)
    const stripeSignatureParts = signature.split(',');
    const timestamp = stripeSignatureParts[0];
    const receivedSignature = stripeSignatureParts[1];

    // Stripe signature: HMAC SHA256 of (timestamp + '.' + raw_body)
    const expectedSignature = await createHmac(
      'SHA-256',
      new TextEncoder().encode(timestamp + '.' + rawBody),
      { key: await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )}
    )
    ).then(sig => 't=' + timestamp + ',' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''));

    if (receivedSignature !== expectedSignature) {
      console.error('Stripe webhook signature verification failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid signature' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const payload: StripeWebhookPayload = JSON.parse(rawBody);

    // Process different Stripe events
    switch (payload.type) {
      case 'payment_intent.succeeded':
        // Payment successful
        const paymentIntent = payload.data.object;
        const bookingId = paymentIntent.metadata.booking_id;

        await processSuccessfulPayment(
          supabaseUrl,
          serviceKey,
          bookingId,
          paymentIntent.id,
          paymentIntent.amount / 100, // Convert from cents to rupees
          paymentIntent.currency.toUpperCase(),
          'stripe',
          'succeeded'
        );
        break;

      case 'payment_intent.payment_failed':
        // Payment failed
        const failedIntent = payload.data.object;
        const failedBookingId = failedIntent.metadata.booking_id;

        await processFailedPayment(
          supabaseUrl,
          serviceKey,
          failedBookingId,
          failedIntent.id,
          'stripe',
          'failed'
        );
        break;

      default:
        console.log(`Unhandled Stripe event: ${payload.type}`);
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: 'Webhook processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Process Successful Payment
 * 
 * @param supabaseUrl - Supabase project URL
 * @param serviceKey - Supabase service role key
 * @param bookingId - Booking ID
 * @param paymentId - Payment gateway payment ID
 * @param amount - Payment amount
 * @param currency - Payment currency
 * @param gateway - Payment gateway used
 * @param paymentStatus - Payment gateway status
 */
async function processSuccessfulPayment(
  supabaseUrl: string,
  serviceKey: string,
  bookingId: string,
  paymentId: string,
  amount: number,
  currency: string,
  gateway: string,
  paymentStatus: string
): Promise<void> {
  try {
    // Update payment record to 'paid'
    await fetch(`${supabaseUrl}/rest/v1/payments?order_id=eq.${paymentId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
    });

    // Update booking to 'completed'
    await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
    });

    console.log(`✅ Payment successful: ${paymentId} for booking: ${bookingId}`);

    // Note: You can also trigger:
    // - Email notification to customer and provider
    // - WhatsApp notification
    // - Push notification
    // via another Supabase Edge Function or third-party service

  } catch (error) {
    console.error('Failed to process successful payment:', error);
    throw error;
  }
}

/**
 * Process Failed Payment
 * 
 * @param supabaseUrl - Supabase project URL
 * @param serviceKey - Supabase service role key
 * @param bookingId - Booking ID
 * @param paymentId - Payment gateway payment ID
 * @param gateway - Payment gateway used
 * @param paymentStatus - Payment gateway status
 */
async function processFailedPayment(
  supabaseUrl: string,
  serviceKey: string,
  bookingId: string,
  paymentId: string,
  gateway: string,
  paymentStatus: string
): Promise<void> {
  try {
    // Update payment record to 'failed'
    await fetch(`${supabaseUrl}/rest/v1/payments?order_id=eq.${paymentId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
    });

    // Update booking to 'cancelled'
    await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
    });

    console.log(`❌ Payment failed: ${paymentId} for booking: ${bookingId}`);

    // Note: You can also trigger:
    // - Failure notification to customer
    // - Retry prompt
    // via another Supabase Edge Function or third-party service

  } catch (error) {
    console.error('Failed to process failed payment:', error);
    throw error;
  }
}
