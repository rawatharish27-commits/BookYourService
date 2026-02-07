// Production-grade password hashing and token generation

import { createHash, randomBytes } from 'crypto';

// Simple hash function for password (since we're using SQLite and want to avoid bcrypt complexity)
// In production with PostgreSQL, use bcrypt for better security
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  if (!salt || !hash) return false;

  const computedHash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  
  return hash === computedHash;
}

// Generate secure random token
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

// Generate unique booking number
export function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString('hex');
  return `BYS${timestamp}${random}`.toUpperCase();
}

// Generate verification code
export function generateVerificationCode(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

// Slug generation
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Mask email for display
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local}@${domain}`;
  
  const masked = local.slice(0, 2) + '*'.repeat(local.length - 2);
  return `${masked}@${domain}`;
}

// Mask phone for display
export function maskPhone(phone: string): string {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}
