import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from '../redis/redis.tokens';
import {
  remainingTokenTtlSeconds,
  revokedAccessTokenKey,
} from './access-token.constants';

@Injectable()
export class AccessTokenService {
  private readonly logger = new Logger(AccessTokenService.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async revoke(
    jti: string,
    exp: number | undefined,
    fallbackTtlSeconds: number,
  ): Promise<void> {
    const ttl = remainingTokenTtlSeconds(exp, fallbackTtlSeconds);

    try {
      await this.redis.set(revokedAccessTokenKey(jti), '1', 'EX', ttl);
    } catch (error) {
      this.logger.warn(
        'Failed to revoke access token',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async isRevoked(jti: string | undefined): Promise<boolean> {
    if (!jti) {
      return true;
    }

    try {
      const exists = await this.redis.exists(revokedAccessTokenKey(jti));
      return exists === 1;
    } catch (error) {
      this.logger.warn(
        'Failed to check access token revocation; allowing the request',
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }
}
