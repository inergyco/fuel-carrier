import { truncate } from './string.utils';

describe('truncate', () => {
  it('returns the original string when it fits', () => {
    expect(truncate('abc', 3)).toBe('abc');
  });

  it('shortens with an ellipsis when too long', () => {
    expect(truncate('abcdef', 4)).toBe('abc…');
  });

  it('returns only an ellipsis when maxLength is 1', () => {
    expect(truncate('abcdef', 1)).toBe('…');
  });
});
