import { PrismaClient, BookingStatus } from '@prisma/client';
import { AppError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

// NOTE: Requires email provider (SendGrid/Nodemailer) and SMS provider (Twilio/Msg91)
// const nodemailer = require('nodemailer');
// const sgMail = require('@sendgrid/mail');
// const twilio = require('twilio');

const prisma = new PrismaClient();

// ============================================
// NOTIFICATION SYSTEM (EMAIL/SMS)
// ============================================
// Purpose: Transactional Emails & SMS Alerts.
// Stack: Prisma + Logger + (SendGrid/Twilio - Mocked).
// Type: Production-Grade (Async, Error Handling).
// 
// IMPORTANT:
// 1. Send Emails (Signup, Booking Confirmation, Cancellation).
// 2. Send SMS (OTP, Booking Status, Alerts).
// 3. Logs all send attempts.
// ============================================

// ============================================
// 1. EMAIL TEMPLATES (MOCK IMPLEMENTATION)
// ============================================

/**
 * Send Signup Email
 * @param to - User Email
 * @param name - User Name
 * @param otp - Verification OTP
 */
export const sendSignupEmail = async (to: string, name: string, otp: string) => {
  logger.info('[NotificationService] Sending Signup Email', { to, name });

  try {
    // TODO: Use real email provider (SendGrid/Nodemailer)
    // Example: await sgMail.send({ ... })
    
    // MOCK: Log Success
    logger.info('[NotificationService] Signup Email Sent (Mock)', { to });
    return { success: true, message: 'Email sent' };
  } catch (error) {
    logger.error('[NotificationService] Signup Email Failed', error);
    return { success: false, message: 'Failed to send email' };
  }
};

/**
 * Send Booking Confirmation Email
 * @param to - Customer Email
 * @param bookingId - Booking ID
 * @param scheduledDate - Scheduled Date
 */
export const sendBookingConfirmationEmail = async (to: string, bookingId: string, scheduledDate: Date) => {
  logger.info('[NotificationService] Sending Booking Confirmation Email', { to, bookingId });

  try {
    // TODO: Use real email provider
    // Example: await sgMail.send({ template: 'booking-confirmation', ... })
    
    // MOCK: Log Success
    logger.info('[NotificationService] Booking Confirmation Email Sent (Mock)', { to, bookingId });
    return { success: true, message: 'Email sent' };
  } catch (error) {
    logger.error('[NotificationService] Booking Confirmation Email Failed', error);
    return { success: false, message: 'Failed to send email' };
  }
};

/**
 * Send Booking Cancellation Email
 * @param to - Customer Email
 * @param bookingId - Booking ID
 * @param reason - Cancellation Reason
 */
export const sendCancellationEmail = async (to: string, bookingId: string, reason: string) => {
  logger.info('[NotificationService] Sending Cancellation Email', { to, bookingId, reason });

  try {
    // TODO: Use real email provider
    
    // MOCK: Log Success
    logger.info('[NotificationService] Cancellation Email Sent (Mock)', { to, bookingId, reason });
    return { success: true, message: 'Email sent' };
  } catch (error) {
    logger.error('[NotificationService] Cancellation Email Failed', error);
    return { success: false, message: 'Failed to send email' };
  }
};

// ============================================
// 2. SMS ALERTS (MOCK IMPLEMENTATION)
// ============================================

/**
 * Send OTP SMS
 * @param to - User Phone
 * @param otp - Verification OTP
 * @param purpose - Purpose (LOGIN, START_JOB, END_JOB)
 */
export const sendOTPSMS = async (to: string, otp: string, purpose: string) => {
  logger.info('[NotificationService] Sending OTP SMS', { to, otp, purpose });

  try {
    // TODO: Use real SMS provider (Twilio/Msg91)
    // Example: await client.messages.create({ body: `Your OTP is ${otp}`, ... })
    
    // MOCK: Log Success
    logger.info('[NotificationService] OTP SMS Sent (Mock)', { to });
    return { success: true, message: 'SMS sent' };
  } catch (error) {
    logger.error('[NotificationService] OTP SMS Failed', error);
    return { success: false, message: 'Failed to send SMS' };
  }
};

/**
 * Send Booking Status SMS (Customer)
 * @param to - Customer Phone
 * @param status - Booking Status (ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED)
 * @param providerName - Provider Name
 */
export const sendBookingStatusSMS = async (to: string, status: BookingStatus, providerName: string) => {
  logger.info('[NotificationService] Sending Booking Status SMS', { to, status, providerName });

  try {
    const message = `Your booking is now ${status}. Provider: ${providerName}`;
    
    // TODO: Use real SMS provider
    
    // MOCK: Log Success
    logger.info('[NotificationService] Booking Status SMS Sent (Mock)', { to, message });
    return { success: true, message: 'SMS sent' };
  } catch (error) {
    logger.error('[NotificationService] Booking Status SMS Failed', error);
    return { success: false, message: 'Failed to send SMS' };
  }
};

/**
 * Send Provider Arrival Alert (Customer)
 * @param to - Customer Phone
 * @param providerName - Provider Name
 */
export const sendProviderArrivalAlert = async (to: string, providerName: string) => {
  logger.info('[NotificationService] Sending Provider Arrival Alert', { to, providerName });

  try {
    const message = `Your provider ${providerName} has arrived.`;
    
    // TODO: Use real SMS provider
    
    // MOCK: Log Success
    logger.info('[NotificationService] Provider Arrival SMS Sent (Mock)', { to, message });
    return { success: true, message: 'SMS sent' };
  } catch (error) {
    logger.error('[NotificationService] Provider Arrival Alert Failed', error);
    return { success: false, message: 'Failed to send SMS' };
  }
};

// ============================================
// 3. BOOKING ALERT TRIGGER (LISTENER)
// ============================================

/**
 * Trigger Notification based on Booking Status Change
 * @param bookingId - Booking ID
 * @param status - New Status
 * @param userId - Customer ID
 * @param providerId - Provider ID (Optional)
 */
export const triggerBookingAlert = async (
  bookingId: string,
  status: BookingStatus,
  userId: string,
  providerId?: string,
) => {
  logger.info('[NotificationService] Triggering Booking Alert', { bookingId, status, userId, providerId });

  // 1. Fetch Booking Details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, user: true, provider: true },
  });

  if (!booking) {
    throw new ValidationError('Booking not found');
  }

  // 2. Fetch User Details
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ValidationError('User not found');
  }

  // 3. Send Notification based on Status
  switch (status) {
    case BookingStatus.PAID:
      await sendBookingConfirmationEmail(user.email, bookingId, booking.scheduledDate);
      await sendBookingStatusSMS(user.phone, BookingStatus.PAID, booking.provider?.businessName || 'Provider');
      break;
    
    case BookingStatus.ASSIGNED:
      await sendBookingStatusSMS(user.phone, BookingStatus.ASSIGNED, booking.provider?.businessName || 'Provider');
      break;

    case BookingStatus.IN_PROGRESS:
      await sendBookingStatusSMS(user.phone, BookingStatus.IN_PROGRESS, booking.provider?.businessName || 'Provider');
      break;

    case BookingStatus.ACTIVE:
      await sendProviderArrivalAlert(user.phone, booking.provider?.businessName || 'Provider');
      break;

    case BookingStatus.COMPLETED:
      await sendBookingStatusSMS(user.phone, BookingStatus.COMPLETED, booking.provider?.businessName || 'Provider');
      // TODO: Ask for Rating (Review)
      break;

    case BookingStatus.CANCELLED:
      await sendCancellationEmail(user.email, bookingId, 'Booking Cancelled');
      await sendBookingStatusSMS(user.phone, BookingStatus.CANCELLED, 'Booking Cancelled');
      break;

    default:
      logger.warn('[NotificationService] Unknown Booking Status for Alert', { status });
  }
};

export default {
  sendSignupEmail,
  sendBookingConfirmationEmail,
  sendCancellationEmail,
  sendOTPSMS,
  sendBookingStatusSMS,
  sendProviderArrivalAlert,
  triggerBookingAlert,
};
