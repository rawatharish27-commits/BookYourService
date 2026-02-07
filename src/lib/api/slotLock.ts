// Production-grade slot locking utility
import { db } from '@/lib/db';
import { BookingStatus } from '@prisma/client';

interface SlotLock {
  id: string;
  bookingId: string | null;
  expiresAt: Date;
}

// In-memory slot locks (for production, use Redis)
const slotLocks = new Map<string, SlotLock>();

const LOCK_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export async function acquireSlotLock(
  serviceId: string,
  date: string,
  time: string
): Promise<{ success: boolean; lockId: string | null }> {
  const lockKey = `${serviceId}-${date}-${time}`;
  
  // Check if lock already exists and is not expired
  const existingLock = slotLocks.get(lockKey);
  
  if (existingLock) {
    if (existingLock.expiresAt > new Date()) {
      // Lock exists and is not expired - someone else has this slot
      const booking = await db.booking.findFirst({
        where: {
          serviceId,
          scheduledDate: date,
          scheduledTime: time,
          status: {
            in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'],
          },
        },
      });
      
      if (booking) {
        return { success: false, lockId: existingLock.bookingId };
      }
      
      // Lock exists but booking doesn't exist - stale lock, remove it
      slotLocks.delete(lockKey);
    } else {
      // Lock exists but is expired, remove it
      slotLocks.delete(lockKey);
    }
  }
  
  // Check if slot is actually available in database
  const existingBooking = await db.booking.findFirst({
    where: {
      serviceId,
      scheduledDate: date,
      scheduledTime: time,
      status: {
        in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'],
      },
    },
  });
  
  if (existingBooking) {
    return { success: false, lockId: existingBooking.id };
  }
  
  // Create new lock
  const lockId = crypto.randomUUID();
  slotLocks.set(lockKey, {
    id: lockId,
    bookingId: null,
    expiresAt: new Date(Date.now() + LOCK_DURATION),
  });
  
  return { success: true, lockId };
}

export async function confirmSlotLock(
  serviceId: string,
  date: string,
  time: string,
  bookingId: string
): Promise<boolean> {
  const lockKey = `${serviceId}-${date}-${time}`;
  const lock = slotLocks.get(lockKey);
  
  if (!lock) {
    return false;
  }
  
  if (lock.bookingId && lock.bookingId !== bookingId) {
    // Lock is held by someone else
    return false;
  }
  
  // Confirm the lock with booking ID
  lock.bookingId = bookingId;
  lock.expiresAt = new Date(Date.now() + LOCK_DURATION);
  slotLocks.set(lockKey, lock);
  
  return true;
}

export async function releaseSlotLock(
  serviceId: string,
  date: string,
  time: string
): Promise<void> {
  const lockKey = `${serviceId}-${date}-${time}`;
  slotLocks.delete(lockKey);
}

export async function cleanupExpiredLocks(): Promise<void> {
  const now = new Date();
  
  for (const [key, lock] of slotLocks.entries()) {
    if (lock.expiresAt < now) {
      slotLocks.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredLocks, 5 * 60 * 1000);
}
