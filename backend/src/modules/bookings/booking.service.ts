import { db } from "../../config/db";
import { bookingRepository } from "./booking.repository";
import { slotLockService } from "../availability/slotLock.service";
import { availabilityService } from "../availability/availability.service";
import { BookingStatus, assertTransition, FINAL_STATES } from "./booking.state";
import { eventBus, EventTypes } from "../../events/eventBus";
import { cancellationService } from "../cancellations/cancellation.service";
import { logger } from "../../utils/logger";
import { trustService } from "../reviews/trust.service";
import { PoolClient } from "pg";
import { assertClientOwnsBooking, assertProviderOwnsBooking } from "../../middlewares/auth.middleware";

export const bookingService = {
  /**
   * Centralized Status Update Engine (HARD GATE)
   */
  async updateStatus(
    bookingId: string, 
    newStatus: BookingStatus, 
    actorId: string, 
    client?: PoolClient, 
    isAdminOverride: boolean = false
  ) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw { status: 404, message: "Booking not found" };

    if (!isAdminOverride) {
        assertTransition(booking.status as BookingStatus, newStatus);
    }

    if (newStatus === BookingStatus.IN_PROGRESS && !isAdminOverride) {
        const isVerified = ['CONFIRMED', 'PROVIDER_ASSIGNED', 'PROVIDER_ACCEPTED'].includes(booking.status);
        if (!isVerified) {
            throw { status: 400, message: "Payment not verified for this booking. Cannot start job." };
        }
    }

    const exec = async (c: PoolClient) => {
        await bookingRepository.updateStatus(bookingId, newStatus, c);
        await bookingRepository.addEvent(bookingId, actorId, `${isAdminOverride ? 'ADMIN OVERRIDE: ' : ''}Status changed to ${newStatus}`, c);

        if (FINAL_STATES.includes(newStatus)) {
            await slotLockService.releaseByBookingId(bookingId);
        }

        return { ...booking, status: newStatus };
    };

    const updatedBooking = client ? await exec(client) : await db.transaction(exec);
    
    eventBus.emit(EventTypes.BOOKING_UPDATED, updatedBooking);
    return updatedBooking;
  },

  async initiate(input: {
    clientId: string;
    subCategoryId: string;
    zoneId: number;
    scheduledTime: string;
    address: string;
    notes: string;
  }) {
    // 🛡️ MASS BOOKING GUARD (STEP 6.7)
    const activeCountRes = await db.query(
        `SELECT COUNT(*) FROM bookings 
         WHERE client_id = $1 AND status NOT IN ('COMPLETED', 'SETTLED', 'CANCELLED', 'FAILED', 'REFUNDED', 'CLOSED')`,
        [input.clientId]
    );
    if (parseInt(activeCountRes.rows[0].count) >= 5) {
        throw { status: 429, message: "Limit reached: You cannot have more than 5 active bookings. Complete or cancel existing ones." };
    }

    return db.transaction(async (client) => {
      const configRes = await client.query(`SELECT value FROM system_configs WHERE key='PLATFORM_FEE_PERCENT'`);
      const feePercent = configRes.rowCount > 0 ? parseFloat(configRes.rows[0].value) : 10;

      const serviceSearch = await client.query(
        `SELECT s.id, s.provider_id, s.price, s.duration_minutes
         FROM services s
         JOIN users u ON u.id = s.provider_id
         JOIN provider_availability pa ON pa.provider_id = s.provider_id
         WHERE s.subcategory_id = $1 
         AND s.zone_id = $2
         AND s.is_active = true 
         AND s.is_approved = true
         AND u.verification_status = 'LIVE'
         AND u.status = 'ACTIVE'
         AND pa.day_of_week = EXTRACT(DOW FROM $3::timestamp)
         AND $3::time >= pa.start_time 
         AND ($3::time + (s.duration_minutes || ' minutes')::interval) <= pa.end_time
         ORDER BY s.price ASC
         LIMIT 5`, 
         [input.subCategoryId, input.zoneId, input.scheduledTime]
      );

      if (serviceSearch.rowCount === 0) {
        throw { status: 404, message: "No professionals available in your zone for this specific time." };
      }

      let selectedService = null;
      for (const cand of serviceSearch.rows) {
        if (cand.provider_id === input.clientId) continue; 
        
        const duration = cand.duration_minutes || 60;
        const isFree = await availabilityService.isProviderAvailable(cand.provider_id, input.scheduledTime, duration);
        if (!isFree) continue;

        try {
            await slotLockService.lockSlot(
                cand.provider_id, 
                input.scheduledTime, 
                duration,
                15, 
                client 
            );
            selectedService = cand;
            break; 
        } catch (e: any) {
            if (e.status === 409) continue;
            throw e; 
        }
      }

      if (!selectedService) {
        throw { status: 409, message: "The selected slot just became unavailable. Please pick another time." };
      }

      const basePrice = Number(selectedService.price);
      const platformFee = Number((basePrice * (feePercent / 100)).toFixed(2));
      const providerAmount = basePrice - platformFee;

      const booking = await bookingRepository.create(client, {
        clientId: input.clientId,
        providerId: selectedService.provider_id,
        serviceId: selectedService.id,
        scheduledTime: input.scheduledTime,
        durationMinutes: selectedService.duration_minutes || 60,
        priceDetails: { total: basePrice, base: basePrice, platform: platformFee, provider: providerAmount },
        address: input.address,
        notes: input.notes
      });

      await client.query(
        `UPDATE slot_locks SET booking_id=$1 WHERE provider_id=$2 AND slot_time=$3`,
        [booking.id, selectedService.provider_id, input.scheduledTime]
      );

      await bookingRepository.addEvent(booking.id, input.clientId, "Slot Secured - Awaiting Payment", client);
      
      return booking;
    });
  },

  async confirmPayment(bookingId: string, transactionId: string) {
      return this.updateStatus(bookingId, BookingStatus.CONFIRMED, 'SYSTEM');
  },

  async acceptBooking(bookingId: string, providerId: string) {
    const booking = await bookingRepository.findById(bookingId);
    // 🛡️ IDOR PROTECTION
    assertProviderOwnsBooking(booking, providerId);

    return this.updateStatus(bookingId, BookingStatus.PROVIDER_ACCEPTED, providerId);
  },

  async rejectBooking(bookingId: string, providerId: string, reason: string) {
    const booking = await bookingRepository.findById(bookingId);
    // 🛡️ IDOR PROTECTION
    assertProviderOwnsBooking(booking, providerId);

    return cancellationService.cancelByProvider(bookingId, providerId, reason || "Provider Rejected");
  },

  async startJob(bookingId: string, providerId: string) {
    const booking = await bookingRepository.findById(bookingId);
    // 🛡️ IDOR PROTECTION
    assertProviderOwnsBooking(booking, providerId);

    return this.updateStatus(bookingId, BookingStatus.IN_PROGRESS, providerId);
  },

  async markProviderCompleted(bookingId: string, providerId: string) {
    const booking = await bookingRepository.findById(bookingId);
    // 🛡️ IDOR PROTECTION
    assertProviderOwnsBooking(booking, providerId);

    return this.updateStatus(bookingId, BookingStatus.PROVIDER_COMPLETED, providerId);
  },

  async customerConfirm(bookingId: string, clientId: string) {
    return db.transaction(async (client) => {
        const booking = await bookingRepository.findById(bookingId);
        // 🛡️ IDOR PROTECTION
        assertClientOwnsBooking(booking, clientId);

        await this.updateStatus(bookingId, BookingStatus.CLOSED, clientId, client);

        const providerAmt = Number(booking.provider_amount);
        await client.query(`UPDATE provider_wallet SET balance = balance + $1 WHERE provider_id=$2`, [providerAmt, booking.provider_id]);
        await client.query(`INSERT INTO wallet_transactions (provider_id, amount, type, reference_id) VALUES ($1, $2, 'CREDIT', $3)`, [booking.provider_id, providerAmt, bookingId]);

        trustService.evaluate(booking.provider_id);
    });
  },

  async getDetails(id: string, userId: string, role: string) {
      const booking = await bookingRepository.findById(id);
      // 🛡️ IDOR PROTECTION
      if (role === 'CLIENT') assertClientOwnsBooking(booking, userId);
      if (role === 'PROVIDER') assertProviderOwnsBooking(booking, userId);
      return booking;
  },

  async listMyBookings(userId: string, role: 'CLIENT' | 'PROVIDER') {
      return bookingRepository.findByUser(userId, role);
  }
};