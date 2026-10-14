import { optionalEmailSchema } from '@fuel-carrier/shared-validation/email';

const schema = optionalEmailSchema(254, {
  tooLong: 'too long',
  invalid: 'invalid',
});

describe('Optional email', () => {
  it('treats empty values as null', () => {
    expect(schema.parse('')).toBeNull();
    expect(schema.parse('   ')).toBeNull();
    expect(schema.parse(null)).toBeNull();
  });

  it('accepts valid emails and trims whitespace', () => {
    expect(schema.parse('ada@example.com')).toBe('ada@example.com');
    expect(schema.parse('  ada@example.com  ')).toBe('ada@example.com');
  });

  it('rejects invalid emails', () => {
    expect(schema.safeParse('not-an-email').success).toBe(false);
    expect(schema.safeParse('ada@').success).toBe(false);
    expect(schema.safeParse('@example.com').success).toBe(false);
  });
});
