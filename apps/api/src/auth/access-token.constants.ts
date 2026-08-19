import type { FastifyRequest } from 'fastify';

export type AccessTokenClaims = {
  jti: string;
  exp?: number;
};

export function revokedAccessTokenKey(jti: string): string {
  return `auth-revoked:${jti}`;
}

export function remainingTokenTtlSeconds(
  exp: number | undefined,
  fallbackSeconds: number,
): number {
  if (typeof exp !== 'number') {
    return Math.max(1, fallbackSeconds);
  }

  const remaining = exp - Math.floor(Date.now() / 1000);
  return Math.max(1, remaining);
}

export function getRequestAccessToken(
  request: FastifyRequest,
): AccessTokenClaims | undefined {
  return (request as FastifyRequest & { accessToken?: AccessTokenClaims })
    .accessToken;
}
