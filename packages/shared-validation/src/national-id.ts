import { z } from 'zod';
import { toLatinDigits } from './car/license-plate';

/** Iranian personal national ID (کد ملی) length. */
export const IRANIAN_NATIONAL_ID_LENGTH = 10;

export const IRANIAN_NATIONAL_ID_INVALID_MESSAGE =
  'National ID must be a valid 10-digit Iranian national ID';

export function normalizeIranianNationalId(value: string): string {
  return toLatinDigits(value.trim());
}

/** Latin digits only. Persian and Arabic-Indic digits are converted first. */
export function toDigitsOnly(value: string): string {
  return toLatinDigits(value).replace(/\D/g, '');
}

/** Any Unicode decimal digit (Latin, Persian, Arabic-Indic, etc.). */
const UNICODE_DIGIT = /\p{Nd}/u;

export function containsDigit(value: string): boolean {
  return UNICODE_DIGIT.test(value);
}

export function stripDigits(value: string): string {
  return value.replace(/\p{Nd}/gu, '');
}

/**
 * Validates an Iranian personal national ID (کد ملی):
 * exactly 10 digits, not all identical, with a valid checksum.
 */
export function isValidIranianNationalId(value: string): boolean {
  const code = normalizeIranianNationalId(value);

  if (!/^\d{10}$/.test(code)) {
    return false;
  }

  // Reject trivial all-same-digit values (e.g. 0000000000).
  if (/^(\d)\1{9}$/.test(code)) {
    return false;
  }

  const checkDigit = Number(code[9]);
  const sum = code
    .slice(0, 9)
    .split('')
    .reduce(function addWeightedDigit(acc, digit, index) {
      return acc + Number(digit) * (10 - index);
    }, 0);
  const remainder = sum % 11;

  return (
    (remainder < 2 && checkDigit === remainder) ||
    (remainder >= 2 && checkDigit === 11 - remainder)
  );
}

/** Required Iranian personal national ID field. */
export function iranianNationalIdSchema(
  invalidMessage = IRANIAN_NATIONAL_ID_INVALID_MESSAGE,
) {
  return z
    .string()
    .min(1, invalidMessage)
    .transform(normalizeIranianNationalId)
    .refine(isValidIranianNationalId, invalidMessage);
}

/**
 * Optional Iranian personal national ID: empty/null → null;
 * otherwise must be a valid 10-digit code.
 */
export function optionalIranianNationalIdSchema(
  invalidMessage = IRANIAN_NATIONAL_ID_INVALID_MESSAGE,
) {
  return z.preprocess(
    function normalizeOptionalNationalId(value) {
      return value == null ? '' : value;
    },
    z
      .string()
      .transform(function toNullableNationalId(value) {
        const normalized = normalizeIranianNationalId(value);
        return normalized.length > 0 ? normalized : null;
      })
      .pipe(
        z.union([
          z.null(),
          z.string().refine(isValidIranianNationalId, invalidMessage),
        ]),
      ),
  );
}
