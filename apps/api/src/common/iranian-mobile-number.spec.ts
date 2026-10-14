import {
  iranianMobileNumberSchema,
  isValidIranianMobileNumber,
  normalizeIranianMobileNumber,
} from '@fuel-carrier/shared-validation/mobile-number';

describe('Iranian mobile number', () => {
  it('normalizes Persian digits and country-code forms', () => {
    expect(normalizeIranianMobileNumber('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
    expect(normalizeIranianMobileNumber('9123456789')).toBe('09123456789');
    expect(normalizeIranianMobileNumber('989123456789')).toBe('09123456789');
    expect(normalizeIranianMobileNumber('00989123456789')).toBe('09123456789');
    expect(normalizeIranianMobileNumber('0912 345 6789')).toBe('09123456789');
  });

  it('accepts valid 11-digit local numbers', () => {
    expect(isValidIranianMobileNumber('09121234567')).toBe(true);
    expect(isValidIranianMobileNumber('۰۹۱۲۱۲۳۴۵۶۷')).toBe(true);
    expect(iranianMobileNumberSchema().parse('9121234567')).toBe('09121234567');
  });

  it('rejects wrong length, letters, and non-09 prefixes', () => {
    expect(isValidIranianMobileNumber('0912')).toBe(false);
    expect(isValidIranianMobileNumber('091212345678')).toBe(false);
    expect(isValidIranianMobileNumber('08121234567')).toBe(false);
    expect(isValidIranianMobileNumber('abcdefghijk')).toBe(false);
    expect(iranianMobileNumberSchema().safeParse('02188765432').success).toBe(
      false,
    );
  });

  it('requires a value', () => {
    expect(iranianMobileNumberSchema().safeParse('').success).toBe(false);
  });
});
