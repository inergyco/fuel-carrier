import {
  containsDigit,
  stripDigits,
} from '@fuel-carrier/shared-validation/national-id';
import { personNameSchema } from '@fuel-carrier/shared-validation/person-name';

describe('Person name', () => {
  it('detects and strips Unicode digits', () => {
    expect(containsDigit('Ali')).toBe(false);
    expect(containsDigit('Ali2')).toBe(true);
    expect(containsDigit('علی۳')).toBe(true);
    expect(stripDigits('Ali2 Reza')).toBe('Ali Reza');
    expect(stripDigits('علی۳')).toBe('علی');
  });

  it('rejects names that contain digits', () => {
    const schema = personNameSchema({
      requiredMessage: 'required',
      tooLongMessage: 'too long',
      noDigitsMessage: 'no digits',
      maxLength: 100,
    });

    expect(schema.parse('Ali')).toBe('Ali');
    expect(schema.safeParse('Ali2').success).toBe(false);
    expect(schema.safeParse('علی۳').success).toBe(false);
  });
});
