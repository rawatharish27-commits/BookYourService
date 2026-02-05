
// STRICT STATE MACHINE
// Enforces the lifecycle defined in Phase 6

import { BookingStatus } from "../../../src/types";

export const allowedTransitions: Record<string, string[]> = {
  [BookingStatus.INITIATED]: [BookingStatus.SLOT_LOCKED, BookingStatus.FAILED],
  [BookingStatus.SLOT_LOCKED]: [BookingStatus.PAYMENT_PENDING, BookingStatus.FAILED, BookingStatus.CANCELLED],
  [BookingStatus.PAYMENT_PENDING]: [BookingStatus.CONFIRMED, BookingStatus.FAILED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.PROVIDER_ASSIGNED, BookingStatus.CANCELLED],
  [BookingStatus.PROVIDER_ASSIGNED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED], // Cancelled here needs Admin override usually
  [BookingStatus.COMPLETED]: [BookingStatus.SETTLED, BookingStatus.REFUNDED],
  [BookingStatus.SETTLED]: [BookingStatus.REFUNDED], 
  [BookingStatus.FAILED]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.REFUNDED]: []
};

// Helper to validate transition
export const canTransition = (from: BookingStatus, to: BookingStatus): boolean => {
    return allowedTransitions[from]?.includes(to) || false;
};
