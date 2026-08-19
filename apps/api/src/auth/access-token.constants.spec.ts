import {
  remainingTokenTtlSeconds,
  revokedAccessTokenKey,
} from './access-token.constants';

describe('access-token helpers', () => {
  it('builds a revoked-token Redis key from jti', () => {
    expect(revokedAccessTokenKey('token-1')).toBe('auth-revoked:token-1');
  });

  it('uses the fallback TTL when exp is missing', () => {
    expect(remainingTokenTtlSeconds(undefined, 120)).toBe(120);
  });

  it('never returns a TTL below 1 second', () => {
    expect(remainingTokenTtlSeconds(0, 120)).toBe(1);
  });
});
