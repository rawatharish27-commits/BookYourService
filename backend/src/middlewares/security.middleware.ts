import { Request, Response, NextFunction } from "express";

/**
 * 🧹 INPUT SANITIZER
 * Recursively trims and cleans all string inputs in body, query, and params.
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Trim and remove any potential script tags (Basic XSS prevention)
        obj[key] = obj[key].trim().replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    return obj;
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

/**
 * 🕵️ PII SCRUBBER
 * Prevents sensitive data from leaking into the structured logs.
 */
export const logScrubber = (data: any) => {
  const SENSITIVE_KEYS = ['password', 'token', 'otp', 'secret', 'cvv', 'cardNumber', 'refresh_token'];
  const scrubbed = { ...data };
  
  for (const key of SENSITIVE_KEYS) {
    if (key in scrubbed) scrubbed[key] = '[REDACTED]';
  }
  
  return scrubbed;
};