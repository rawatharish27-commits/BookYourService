import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting - in-memory store (production: use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_CONFIG = {
  // API routes
  api: {
    windowMs: 60000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  // Auth endpoints
  auth: {
    windowMs: 900000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
  },
  // Search endpoints
  search: {
    windowMs: 60000, // 1 minute
    maxRequests: 20, // 20 searches per minute
  },
  // Booking endpoints
  booking: {
    windowMs: 60000, // 1 minute
    maxRequests: 10, // 10 bookings per minute
  },
};

// Get client IP address
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || request.headers.get('x-real-ip') || request.ip || 'unknown';
  return ip;
}

// Generate rate limit key
function getRateLimitKey(ip: string, endpoint: string): string {
  return `ratelimit:${ip}:${endpoint}`;
}

// Check rate limit
export function checkRateLimit(ip: string, endpoint: 'api' | 'auth' | 'search' | 'booking'): boolean {
  const config = RATE_LIMIT_CONFIG[endpoint];
  const key = getRateLimitKey(ip, endpoint);
  const now = Date.now();

  // Clean old entries
  for (const [existingKey, data] of rateLimitMap.entries()) {
    if (now - data.resetTime > config.windowMs) {
      rateLimitMap.delete(existingKey);
    }
  }

  // Check current limit
  const existing = rateLimitMap.get(key);
  if (!existing) {
    rateLimitMap.set(key, { count: 1, resetTime: now });
    return true;
  }

  if (now - existing.resetTime < config.windowMs) {
    if (existing.count >= config.maxRequests) {
      return false; // Rate limited
    }
    existing.count++;
  }

  return true; // Within limit
}

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=()');

  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

// Detect common attack patterns
export function detectAttackPatterns(input: string): { isSuspicious: boolean; score: number } {
  let score = 0;
  const patterns = [
    // SQL Injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND|WHERE)\b)/gi,
    // XSS patterns
    /(<script|<iframe|<object|javascript:|onerror=)/gi,
    // Command injection
    /(;|\||&|\$\(|`)/g,
    // Path traversal
    /(\.\.|\.\.\.\.\.\/|\.\.\.\.\/)/gi,
  ];

  for (const pattern of patterns) {
    if (pattern.test(input)) {
      score += 10;
    }
  }

  // Check for very long strings (potential DoS)
  if (input.length > 10000) {
    score += 5;
  }

  return {
    isSuspicious: score > 0,
    score,
  };
}

// Rate limit exceeded response
export function rateLimitResponse(resetAfter: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'बहुत बहुत, बहुत बहुत, request bahut tez kar chuke hain. Thoda ruk jaiye aur fir koshish karein.',
      message_en: 'Too many requests. Please wait and try again.',
      resetAfter,
    },
    { status: 429 }
  );
}

// Suspicious activity response
export function suspiciousActivityResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'SUSPICIOUS_ACTIVITY',
      message: 'Security alert: Unusual activity detected. Please contact support if this continues.',
      message_en: 'Security alert: Unusual activity detected.',
    },
    { status: 403 }
  );
}

// IP block response
export function blockedIpResponse(reason: string = 'Security violation'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'BLOCKED',
      message: `आपके IP address को अस्थायित रूप से अवरोजित किया गया है. ${reason}`,
      message_en: `Your IP address has been blocked. ${reason}`,
    },
    { status: 403 }
  );
}
