
import { cancellationRepository } from "./cancellation.repository";
import { DEFAULT_POLICY } from "./cancellation.policy";
import { bookingRepository } from "../bookings/booking.repository";
import { paymentRepository } from "../payments/payment.repository";
import { slotLockService } from "../availability/slotLock.service";
import { paymentService } from "../payments/payment.service"; // Import Payment Service

export const cancellationService = {
  async cancelByClient(bookingId: string, clientId: string, reason: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw { status: 404, message: "Booking not found" };
    if (booking.client_id !== clientId) throw { status: 403, message: "Not your booking" };

    if (['COMPLETED', 'CANCELLED', 'FAILED'].includes(booking.status)) {
        throw { status: 400, message: "Booking cannot be cancelled in current state" };
    }

    // 1. Calculate Refund/Penalty
    let refundAmount = 0;
    let penaltyAmount = 0;
    const paidAmount = Number(booking.total_amount); 

    if (booking.status === 'PAYMENT_PENDING' || booking.status === 'INITIATED') {
        refundAmount = 0;
        penaltyAmount = 0;
    } else {
        const scheduledTime = new Date(booking.scheduled_time);
        const now = new Date();
        const hoursUntil = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntil > DEFAULT_POLICY.cutoffHours) {
            refundAmount = paidAmount;
            penaltyAmount = 0;
        } else {
            penaltyAmount = (paidAmount * DEFAULT_POLICY.clientPenaltyPercent) / 100;
            refundAmount = paidAmount - penaltyAmount;
        }
    }

    // 2. Ledger Updates & Real Refund
    if (penaltyAmount > 0) {
        await paymentRepository.addLedgerEntry({
            bookingId,
            amount: -penaltyAmount, 
            type: 'COMMISSION', 
            description: 'CLIENT_CANCELLATION_PENALTY'
        });
    }

    if (refundAmount > 0) {
        const payment = await paymentRepository.getByBookingId(bookingId);
        if (payment) {
            await cancellationRepository.createRefund(payment.id, refundAmount, "Client Cancellation");
            
            await paymentRepository.addLedgerEntry({
                bookingId,
                amount: -refundAmount, 
                type: 'REFUND',
                description: 'CLIENT_REFUND'
            });
            
            // TRIGGER REAL REFUND
            try {
                await paymentService.processRefund(bookingId, refundAmount);
            } catch (e) {
                // Log error but don't fail the cancellation state update (Requires admin intervention)
                console.error("Gateway Refund Failed", e);
            }
        }
    }

    await cancellationRepository.markCancelled(bookingId, reason, "CLIENT");
    await slotLockService.releaseByBookingId(bookingId);

    return { 
        status: "CANCELLED", 
        refundAmount, 
        penaltyAmount,
        message: refundAmount > 0 ? `Refund of ${refundAmount} initiated.` : "Booking cancelled."
    };
  },

  async cancelByProvider(bookingId: string, providerId: string, reason: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw { status: 404, message: "Booking not found" };
    if (booking.provider_id !== providerId) throw { status: 403, message: "Not your booking" };

    if (['COMPLETED', 'CANCELLED', 'FAILED'].includes(booking.status)) {
        throw { status: 400, message: "Booking cannot be cancelled in current state" };
    }

    const paidAmount = Number(booking.total_amount);
    
    if (booking.status !== 'PAYMENT_PENDING' && booking.status !== 'INITIATED') {
        const payment = await paymentRepository.getByBookingId(bookingId);
        if (payment) {
            await cancellationRepository.createRefund(payment.id, paidAmount, "Provider Cancellation");
            
            await paymentRepository.addLedgerEntry({
                bookingId,
                amount: -paidAmount,
                type: 'REFUND',
                description: 'PROVIDER_CANCEL_REFUND'
            });

            // TRIGGER REAL REFUND
            try {
                await paymentService.processRefund(bookingId, paidAmount);
            } catch (e) {
                console.error("Gateway Refund Failed", e);
            }
        }
    }

    await cancellationRepository.markCancelled(bookingId, reason, "PROVIDER");
    await slotLockService.releaseByBookingId(bookingId);

    return { status: "CANCELLED", refundAmount: paidAmount, message: "Cancelled. Client refunded fully." };
  },
};
