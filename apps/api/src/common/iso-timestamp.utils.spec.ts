import { toIsoTimestamp, toIsoTimestampOrNull } from './iso-timestamp.utils';

describe('iso-timestamp.utils', () => {
  it('passes through ISO strings', () => {
    expect(toIsoTimestamp('2026-09-14T10:00:00.000Z')).toBe(
      '2026-09-14T10:00:00.000Z',
    );
  });

  it('serializes Date values', () => {
    expect(toIsoTimestamp(new Date('2026-09-14T10:00:00.000Z'))).toBe(
      '2026-09-14T10:00:00.000Z',
    );
  });

  it('maps nullish to null', () => {
    expect(toIsoTimestampOrNull(null)).toBeNull();
    expect(toIsoTimestampOrNull(undefined)).toBeNull();
  });
});
