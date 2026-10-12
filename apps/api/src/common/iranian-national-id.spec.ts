import {
  iranianNationalIdSchema,
  isValidIranianNationalId,
  optionalIranianNationalIdSchema,
} from '@fuel-carrier/shared-validation/national-id';

describe('Iranian national ID', () => {
  it('accepts valid 10-digit codes and Persian digits', () => {
    expect(isValidIranianNationalId('0012345679')).toBe(true);
    expect(isValidIranianNationalId('۰۱۲۳۴۵۶۷۸۹')).toBe(true);
    expect(iranianNationalIdSchema().parse('۰۰۱۲۳۴۵۶۷۹')).toBe('0012345679');
  });

  it('rejects wrong length, letters, all-same digits, and bad checksums', () => {
    expect(isValidIranianNationalId('123')).toBe(false);
    expect(isValidIranianNationalId('12345678901')).toBe(false);
    expect(isValidIranianNationalId('abcdefghij')).toBe(false);
    expect(isValidIranianNationalId('0000000000')).toBe(false);
    expect(isValidIranianNationalId('0012345678')).toBe(false);
    expect(iranianNationalIdSchema().safeParse('0012345678').success).toBe(
      false,
    );
  });

  it('treats empty optional national ID as null', () => {
    expect(optionalIranianNationalIdSchema().parse('')).toBeNull();
    expect(optionalIranianNationalIdSchema().parse(null)).toBeNull();
    expect(optionalIranianNationalIdSchema().parse('0012345679')).toBe(
      '0012345679',
    );
    expect(
      optionalIranianNationalIdSchema().safeParse('0012345678').success,
    ).toBe(false);
  });
});
