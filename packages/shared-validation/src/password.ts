import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 12;

const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_DIGIT = /\d/;
const HAS_SPECIAL = /[^A-Za-z0-9]/;

export function getPasswordStrengthErrors(password: string): string[] {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!HAS_UPPERCASE.test(password)) {
    errors.push('must contain at least one uppercase letter');
  }
  if (!HAS_LOWERCASE.test(password)) {
    errors.push('must contain at least one lowercase letter');
  }
  if (!HAS_DIGIT.test(password)) {
    errors.push('must contain at least one number');
  }
  if (!HAS_SPECIAL.test(password)) {
    errors.push('must contain at least one special character');
  }

  return errors;
}

export function isStrongPassword(password: string): boolean {
  return getPasswordStrengthErrors(password).length === 0;
}

export function assertStrongPassword(password: string): void {
  const errors = getPasswordStrengthErrors(password);
  if (errors.length > 0) {
    throw new Error(`Password ${errors.join(', ')}`);
  }
}

export const strongPasswordSchema: z.ZodType<string> = z
  .string()
  .superRefine((password, ctx) => {
    for (const message of getPasswordStrengthErrors(password)) {
      ctx.addIssue({ code: 'custom', message });
    }
  });
