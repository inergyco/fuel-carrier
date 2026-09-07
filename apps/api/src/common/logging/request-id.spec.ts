import { asHeaderValue, resolveRequestId } from './request-id';

describe('resolveRequestId', () => {
  it('uses a non-empty header value', () => {
    expect(resolveRequestId('abc-123')).toBe('abc-123');
  });

  it('trims whitespace', () => {
    expect(resolveRequestId('  abc-123  ')).toBe('abc-123');
  });

  it('generates a uuid when header is missing', () => {
    const id = resolveRequestId(undefined);
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});

describe('asHeaderValue', () => {
  it('keeps strings', () => {
    expect(asHeaderValue('abc')).toBe('abc');
  });

  it('rejects non-string values', () => {
    expect(asHeaderValue(42)).toBeUndefined();
  });
});
