export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

const POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

const SPECIAL_RE = /[!@#$%^&*()\-_=+\[\]{};':",.<>/?\\|`~]/;

export function validatePassword(pw: string): PasswordValidation {
  const errors: string[] = [];
  if (pw.length < POLICY.minLength)        errors.push(`At least ${POLICY.minLength} characters`);
  if (POLICY.requireUppercase && !/[A-Z]/.test(pw)) errors.push('One uppercase letter');
  if (POLICY.requireLowercase && !/[a-z]/.test(pw)) errors.push('One lowercase letter');
  if (POLICY.requireNumber   && !/\d/.test(pw))     errors.push('One number');
  if (POLICY.requireSpecial  && !SPECIAL_RE.test(pw)) errors.push('One special character');
  return { valid: errors.length === 0, errors };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

/** Trim + clamp length — prevents oversized input reaching the DB */
export function sanitize(value: string, maxLen = 255): string {
  return value.trim().slice(0, maxLen);
}
