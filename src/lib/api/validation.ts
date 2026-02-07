// Production-grade validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long',
    });
  }

  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
    });
  }

  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
    });
  }

  if (!/[0-9]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one number',
    });
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one special character',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Phone validation (Indian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Date validation (YYYY-MM-DD format)
export function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const parsed = new Date(date);
  return parsed instanceof Date && !isNaN(parsed.getTime());
}

// Time validation (HH:MM format)
export function isValidTime(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

// Rating validation (1-5)
export function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
}

// Price validation
export function isValidPrice(price: number): boolean {
  return price >= 0 && price <= 10000000 && Number.isFinite(price);
}

// Required field validation
export function validateRequired(value: any, fieldName: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (value === null || value === undefined || value === '') {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// String length validation
export function validateStringLength(
  value: string,
  fieldName: string,
  min: number,
  max: number
): ValidationResult {
  const errors: ValidationError[] = [];

  if (value.length < min) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be at least ${min} characters`,
    });
  }

  if (value.length > max) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must not exceed ${max} characters`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Number range validation
export function validateNumberRange(
  value: number,
  fieldName: string,
  min: number,
  max: number
): ValidationResult {
  const errors: ValidationError[] = [];

  if (value < min || value > max) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be between ${min} and ${max}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Sanitize input
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

// Sanitize string array
export function sanitizeStringArray(input: string[]): string[] {
  return input.map(item => sanitizeInput(item)).filter(item => item.length > 0);
}
