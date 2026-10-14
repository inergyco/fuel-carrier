import { z } from 'zod';
import { toDigitsOnly } from './national-id';

/** Iranian mobile number (شماره موبایل) length in local `09…` form. */
export const IRANIAN_MOBILE_NUMBER_LENGTH = 11;

export const IRANIAN_MOBILE_NUMBER_INVALID_MESSAGE =
  'Mobile number must be a valid 11-digit Iranian mobile number';

/**
 * Normalize to Latin digits in local `09xxxxxxxxx` form.
 * Accepts `09…`, `9…`, `98…`, and `0098…` inputs.
 */
export function normalizeIranianMobileNumber(value: string): string {
  let digits = toDigitsOnly(value.trim());

  if (digits.startsWith('0098')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('98') && digits.length >= 12) {
    digits = digits.slice(2);
  }

  if (digits.length === 10 && digits.startsWith('9')) {
    digits = `0${digits}`;
  }

  return digits;
}

/**
 * Validates an Iranian mobile number:
 * exactly 11 digits in local form starting with `09`.
 */
export function isValidIranianMobileNumber(value: string): boolean {
  const mobile = normalizeIranianMobileNumber(value);
  return /^09\d{9}$/.test(mobile);
}

/** Required Iranian mobile number field. */
export function iranianMobileNumberSchema(
  invalidMessage = IRANIAN_MOBILE_NUMBER_INVALID_MESSAGE,
  requiredMessage = invalidMessage,
) {
  return z
    .string()
    .min(1, requiredMessage)
    .transform(normalizeIranianMobileNumber)
    .refine(isValidIranianMobileNumber, invalidMessage);
}
