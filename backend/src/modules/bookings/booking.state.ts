export enum BookingStatus {
  INITIATED = "INITIATED",
  SLOT_LOCKED = "SLOT_LOCKED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  CONFIRMED = "CONFIRMED",
  PROVIDER_ASSIGNED = "PROVIDER_ASSIGNED",
  PROVIDER_ACCEPTED = "PROVIDER_ACCEPTED",
  IN_PROGRESS = "IN_PROGRESS",
  PROVIDER_COMPLETED = "PROVIDER_COMPLETED",
  CUSTOMER_CONFIRMED = "CUSTOMER_CONFIRMED",
  COMPLETED = "COMPLETED",
  SETTLED = "SETTLED",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

/**
 * States that signify the end of a booking lifecycle.
 */
export const FINAL_STATES: BookingStatus[] = [
  BookingStatus.CANCELLED,
  BookingStatus.COMPLETED,
  BookingStatus.FAILED,
  BookingStatus.REFUNDED,
  BookingStatus.CLOSED
];

/**
 * SOURCE OF TRUTH: Transition Rules
 */
export const BOOKING_STATE_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.INITIATED]: [BookingStatus.SLOT_LOCKED, BookingStatus.FAILED],
  [BookingStatus.SLOT_LOCKED]: [BookingStatus.PAYMENT_PENDING, BookingStatus.FAILED, BookingStatus.CANCELLED],
  [BookingStatus.PAYMENT_PENDING]: [BookingStatus.CONFIRMED, BookingStatus.FAILED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.PROVIDER_ASSIGNED, BookingStatus.CANCELLED],
  [BookingStatus.PROVIDER_ASSIGNED]: [BookingStatus.PROVIDER_ACCEPTED, BookingStatus.CANCELLED],
  [BookingStatus.PROVIDER_ACCEPTED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.PROVIDER_COMPLETED], 
  [BookingStatus.PROVIDER_COMPLETED]: [BookingStatus.CUSTOMER_CONFIRMED],
  [BookingStatus.CUSTOMER_CONFIRMED]: [BookingStatus.CLOSED],
  [BookingStatus.COMPLETED]: [BookingStatus.SETTLED, BookingStatus.REFUNDED, BookingStatus.CLOSED],
  [BookingStatus.SETTLED]: [BookingStatus.REFUNDED, BookingStatus.CLOSED],
  [BookingStatus.CLOSED]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.FAILED]: [],
  [BookingStatus.REFUNDED]: []
};

/**
 * Validator used by services to prevent illegal status jumps.
 */
export function isValidTransition(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_STATE_TRANSITIONS[from]?.includes(to) || false;
}

/**
 * Throws error if transition is illegal.
 */
export function assertTransition(from: BookingStatus, to: BookingStatus) {
  if (!isValidTransition(from, to)) {
    throw {
      status: 400,
      message: `Illegal state jump: ${from} → ${to} is not permitted.`,
    };
  }
}