import { db } from "../../config/db";
import { bookingRepository } from "./booking.repository";
import { slotLockService } from "../availability/slotLock.service";
import { availabilityService } from "../availability/availability.service";
import { BookingStatus, assertTransition, isValidTransition } from "./booking.state";
import { eventBus, EventTypes } from "../../events/eventBus";
import { PoolClient } from "pg";

export const bookingService = {
  async initiate(input: {
    clientId: string;
    subCategoryId: string;
    zoneId: number;
    scheduledTime: string;
    address: string;
    notes: string;
  }) {
    return db.transaction(async (client) => {
      // 🛡️ KYC ENFORCEMENT GATE
      const serviceSearch = await client.query(
        `SELECT s.id, s.provider_id, s.price, s.duration_minutes
         FROM services s
         JOIN users u ON u.id = s.provider_id
         JOIN providers p ON p.user_id = u.id
         JOIN provider_kyc k ON k.provider_id = p.id
         WHERE s.subcategory_id = $1 
         AND s.zone_id = $2
         AND s.is_active = true 
         AND s.is_approved = true
         AND k.status = 'APPROVED' -- ⛔ CRITICAL: Only KYC approved pros
         AND u.status = 'ACTIVE'
         ORDER BY s.price ASC
         LIMIT 5`, 
         [input.subCategoryId, input.zoneId]
      );

      if (serviceSearch.rowCount === 0) {
        throw { status: 404, message: "No verified professionals available for this request." };
      }

      // Slot locking logic...
      let selectedService = null;
      for (const cand of serviceSearch.rows) {
        const isFree = await availabilityService.isProviderAvailable(cand.provider_id, input.scheduledTime, cand.duration_minutes || 60);
        if (!isFree) continue;

        try {
            await slotLockService.lockSlot(cand.provider_id, input.scheduledTime, cand.duration_minutes || 60, 15, client);
            selectedService = cand;
            break;
        } catch (e) { continue; }
      }

      if (!selectedService) throw { status: 409, message: "Selected slot is no longer available." };

      const booking = await bookingRepository.create(client, {
        clientId: input.clientId,
        providerId: selectedService.provider_id,
        serviceId: selectedService.id,
        scheduledTime: input.scheduledTime,
        durationMinutes: selectedService.duration_minutes || 60,
        priceDetails: { total: selectedService.price, base: selectedService.price, platform: 0, provider: selectedService.price },
        address: input.address,
        notes: input.notes
      });

      return booking;
    });
  },

  // Fix: Added updateStatus method to resolve missing property error
  async updateStatus(id: string, newStatus: BookingStatus, actorId: string, client?: PoolClient, isAdminOverride: boolean = false) {
    const exec = async (c: PoolClient) => {
      const booking = await bookingRepository.findById(id);
      if (!booking) throw { status: 404, message: "Booking not found" };

      if (!isAdminOverride) {
        assertTransition(booking.status, newStatus);
      }

      await bookingRepository.updateStatus(id, newStatus, c);
      await bookingRepository.addEvent(id, actorId, `Status changed to ${newStatus}`, c);

      const updated = await bookingRepository.findById(id);
      await eventBus.emit(EventTypes.BOOKING_UPDATED, updated, c);
      return updated;
    };

    if (client) return await exec(client);
    return await db.transaction(exec);
  },

  // Fix: Added getDetails method to resolve missing property error
  async getDetails(id: string, userId: string, role: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) throw { status: 404, message: "Booking not found" };

    if (role === 'CLIENT' && booking.client_id !== userId) throw { status: 403, message: "Forbidden" };
    if (role === 'PROVIDER' && booking.provider_id !== userId) throw { status: 403, message: "Forbidden" };

    return booking;
  },

  // Fix: Added listMyBookings method to resolve missing property error
  async listMyBookings(userId: string, role: 'CLIENT' | 'PROVIDER') {
    return bookingRepository.findByUser(userId, role);
  },

  // Fix: Added accept method to resolve missing property error
  async accept(id: string, providerId: string) {
    return this.updateStatus(id, BookingStatus.PROVIDER_ACCEPTED, providerId);
  },

  // Fix: Added reject method to resolve missing property error
  async reject(id: string, providerId: string, reason: string) {
    // Rejection usually triggers reassignment logic, for now we just cancel
    return this.updateStatus(id, BookingStatus.CANCELLED, providerId);
  },

  // Fix: Added start method to resolve missing property error
  async start(id: string, providerId: string) {
    return this.updateStatus(id, BookingStatus.IN_PROGRESS, providerId);
  },

  // Fix: Added complete method to resolve missing property error
  async complete(id: string, providerId: string) {
    return this.updateStatus(id, BookingStatus.COMPLETED, providerId);
  },

  // Fix: Added markProviderCompleted method to resolve missing property error
  async markProviderCompleted(id: string, providerId: string) {
    return this.updateStatus(id, BookingStatus.PROVIDER_COMPLETED, providerId);
  },

  // Fix: Added customerConfirm method to resolve missing property error
  async customerConfirm(id: string, clientId: string) {
    return this.updateStatus(id, BookingStatus.CUSTOMER_CONFIRMED, clientId);
  }
};