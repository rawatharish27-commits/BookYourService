import { PrismaClient, BookingStatus } from '@prisma/client';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// ============================================
// PAYMENT STATE MACHINE (GATEWAY WEBHOOKS)
// ============================================
// Purpose: Handle Real Payment Gateway Events (Razorpay/Stripe).
// Sync Payment Status with Booking Status Machine.
// Stack: Prisma + Logger.
// Type: Production-Grade (Idempotency, Error Handling).
// 
// IMPORTANT:
// 1. Handles `payment.captured` (Success) -> Updates Booking to `PAID`.
// 2. Handles `payment.failed` (Failure) -> Updates Booking to `FAILED_PAYMENT`.
// 3. Ensures Idempotency (Duplicate Webhooks).
// 4. Handles Refunds (Backend Triggered).
// ============================================

// ============================================
// 1. WEBHOOK HANDLER: RAZORPAY
// ============================================

/**
 * Handle Razorpay Webhook
 * @param body - Raw Webhook Body (JSON)
 * @param headers - Request Headers (Verify Signature in Prod)
 */
export const handleRazorpayWebhook = async (body: any, headers: any) => {
  logger.info('[PaymentService] Razorpay Webhook Received', { type: body.event?.payload?.payment?.entity?.type });

  try {
    const eventType = body?.event?.payload?.payment?.entity?.type;

    // CASE A: PAYMENT CAPTURED (SUCCESS)
    if (eventType === 'payment.captured') {
      const paymentId = body?.event?.payload?.payment?.entity?.id;
      const amount = body?.event?.payload?.payment?.entity?.amount;
      const notes = body?.event?.payload?.payment?.entity?.notes; // Contains Booking ID

      // 1. Validate Payment
      if (!paymentId || !amount) {
        throw new ValidationError('Invalid payment payload from Razorpay');
      }

      // 2. Extract Booking ID from Notes
      // NOTE: Razorpay `notes` field is where we pass `booking_id` during order creation.
      const bookingId = notes?.booking_id;

      if (!bookingId) {
        logger.warn('[PaymentService] Payment captured but no booking_id found in notes', { paymentId });
        throw new ValidationError('Payment captured without Booking ID');
      }

      // 3. Idempotency Check (Has this webhook been processed?)
      const paymentRecord = await prisma.payment.findUnique({
        where: { gatewayTxnId: paymentId },
      });

      if (paymentRecord && paymentRecord.status === 'COMPLETED') {
        logger.info('[PaymentService] Payment already processed (Idempotent)', { paymentId });
        return { success: true, message: 'Webhook already processed' };
      }

      // 4. Start Transaction
      await prisma.$transaction(async (tx) => {
        // A. Update Payment Record
        const payment = await tx.payment.upsert({
          where: { gatewayTxnId: paymentId },
          update: { status: 'COMPLETED', amount: parseInt(amount) / 100 }, // Razorpay returns in paise
          create: {
            gatewayTxnId: paymentId,
            gateway: 'RAZORPAY',
            status: 'COMPLETED',
            currency: 'INR',
            bookingId: bookingId,
          },
        });

        // B. Update Booking Status (PAYMENT_CAPTURED -> PAID)
        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.PAID, // ✅ Booking Confirmed (Money Received)
            paidAt: new Date(),
          },
        });

        logger.info('[PaymentService] Booking Updated to PAID', { bookingId, paymentId });
      });

      return { success: true, message: 'Payment captured and booking confirmed' };
    }

    // CASE B: PAYMENT FAILED (FAILURE)
    else if (eventType === 'payment.failed') {
      const paymentId = body?.event?.payload?.payment?.entity?.id;
      const notes = body?.event?.payload?.payment?.entity?.notes;
      const bookingId = notes?.booking_id;

      if (!bookingId) {
        logger.warn('[PaymentService] Payment failed but no booking_id found in notes', { paymentId });
        throw new ValidationError('Payment failed without Booking ID');
      }

      await prisma.$transaction(async (tx) => {
        // A. Update Payment Record
        await tx.payment.update({
          where: { gatewayTxnId: paymentId },
          data: { status: 'FAILED' },
        });

        // B. Update Booking Status (PAYMENT_FAILED)
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.PAYMENT_FAILED },
        });

        logger.info('[PaymentService] Booking Updated to PAYMENT_FAILED', { bookingId, paymentId });
      });

      return { success: true, message: 'Payment failed and booking updated' };
    }

    // CASE C: REFUND INITIATED (ADMIN/BACKEND)
    else if (eventType === 'refund.processed') {
      const paymentId = body?.event?.payload?.refund?.entity?.id;
      const notes = body?.event?.payload?.refund?.entity?.notes;
      const bookingId = notes?.booking_id;
      const amount = body?.event?.payload?.refund?.entity?.amount;

      if (!bookingId) {
        throw new ValidationError('Refund processed without Booking ID');
      }

      await prisma.$transaction(async (tx) => {
        // A. Update Payment Record
        await tx.payment.update({
          where: { gatewayTxnId: paymentId }, // or refundId
          data: { status: 'REFUNDED' },
        });

        // B. Update Booking Status (REFUNDED)
        // NOTE: We also trigger Wallet Credit here (Clawback) if payment was RELEASED.
        // BUT if payment was just CAPTURED, we just mark booking REFUNDED.
        // Wallet Logic: `refund.service.ts` handles wallet credit/debit.

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.REFUNDED },
        });

        logger.info('[PaymentService] Booking Updated to REFUNDED', { bookingId, amount });
      });

      return { success: true, message: 'Booking refunded successfully' };
    }

    // CASE D: UNKNOWN EVENT
    else {
      logger.warn('[PaymentService] Unknown Razorpay Event', { eventType });
      return { success: true, message: 'Event ignored (Unknown)' };
    }

  } catch (error) {
    logger.error('[PaymentService] Razorpay Webhook Failed', error);
    // 422 Validation Error -> 400 Bad Request
    // 500 Internal Error -> 500 Internal Server Error
    throw error instanceof AppError ? error : new AppError('Webhook processing failed', 500);
  }
};

// ============================================
// 2. WEBHOOK HANDLER: STRIPE
// ============================================

/**
 * Handle Stripe Webhook
 * @param body - Raw Webhook Body (JSON)
 * @param signature - Request Headers (Verify Signature in Prod)
 */
export const handleStripeWebhook = async (body: any, signature: string) => {
  logger.info('[PaymentService] Stripe Webhook Received', { type: body.type });

  try {
    const eventType = body.type;

    // CASE A: PAYMENT INTENT SUCCEEDED (SUCCESS)
    if (eventType === 'payment_intent.succeeded') {
      const paymentId = body.data.object.id;
      const amount = body.data.object.amount; // Stripe returns in cents
      const metadata = body.data.object.metadata; // Contains Booking ID

      // 1. Validate Payment
      if (!paymentId || !amount) {
        throw new ValidationError('Invalid payment payload from Stripe');
      }

      // 2. Extract Booking ID from Metadata
      const bookingId = metadata?.booking_id;

      if (!bookingId) {
        logger.warn('[PaymentService] Payment succeeded but no booking_id in metadata', { paymentId });
        throw new ValidationError('Payment succeeded without Booking ID');
      }

      // 3. Idempotency Check
      const paymentRecord = await prisma.payment.findUnique({
        where: { gatewayTxnId: paymentId },
      });

      if (paymentRecord && paymentRecord.status === 'COMPLETED') {
        logger.info('[PaymentService] Payment already processed (Idempotent)', { paymentId });
        return { success: true, message: 'Webhook already processed' };
      }

      // 4. Start Transaction
      await prisma.$transaction(async (tx) => {
        // A. Create/Update Payment Record
        const payment = await tx.payment.upsert({
          where: { gatewayTxnId: paymentId },
          update: { status: 'COMPLETED', amount: amount / 100 }, // Stripe returns in cents
          create: {
            gatewayTxnId: paymentId,
            gateway: 'STRIPE',
            status: 'COMPLETED',
            currency: 'USD', // Stripe default (or INR)
            bookingId: bookingId,
          },
        });

        // B. Update Booking Status
        const booking = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.PAID,
            paidAt: new Date(),
          },
        });

        logger.info('[PaymentService] Booking Updated to PAID (Stripe)', { bookingId, paymentId });
      });

      return { success: true, message: 'Payment captured and booking confirmed' };
    }

    // CASE B: PAYMENT FAILED
    else if (eventType === 'payment_intent.payment_failed') {
      const paymentId = body.data.object.id;
      const metadata = body.data.object.metadata;
      const bookingId = metadata?.booking_id;

      if (!bookingId) {
        throw new ValidationError('Payment failed without Booking ID');
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { gatewayTxnId: paymentId },
          data: { status: 'FAILED' },
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.PAYMENT_FAILED },
        });

        logger.info('[PaymentService] Booking Updated to PAYMENT_FAILED (Stripe)', { bookingId, paymentId });
      });

      return { success: true, message: 'Payment failed and booking updated' };
    }

    // CASE C: UNKNOWN EVENT
    else {
      logger.warn('[PaymentService] Unknown Stripe Event', { eventType });
      return { success: true, message: 'Event ignored (Unknown)' };
    }

  } catch (error) {
    logger.error('[PaymentService] Stripe Webhook Failed', error);
    throw error instanceof AppError ? error : new AppError('Webhook processing failed', 500);
  }
};

export default {
  handleRazorpayWebhook,
  handleStripeWebhook,
};
