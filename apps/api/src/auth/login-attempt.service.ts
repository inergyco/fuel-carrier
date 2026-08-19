import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
import Redis from 'ioredis';
import { extractClientIp } from '../audit-logs/audit-log.utils';
import { createApiException } from '../common/exceptions/api.exception';
import { REDIS } from '../redis/redis.tokens';
import {
  LOGIN_ATTEMPT_IP_LIMIT,
  LOGIN_ATTEMPT_USER_LIMIT,
  LOGIN_ATTEMPT_WINDOW_SECONDS,
  loginAttemptKeys,
  loginPortalFromPath,
  usernameFromLoginBody,
} from './login-attempt.constants';

@Injectable()
export class LoginAttemptService {
  private readonly logger = new Logger(LoginAttemptService.name);

  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  async assertAllowed(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const keys = this._keysFor(request);

    try {
      const [ipCount, userCount] = await Promise.all([
        this._readCount(keys.ip),
        this._readCount(keys.user),
      ]);

      if (ipCount >= this._ipLimit() || userCount >= this._userLimit()) {
        const retryAfterSeconds = await this._retryAfterSeconds(keys);
        void reply.header('Retry-After', String(retryAfterSeconds));
        throw createApiException(
          HttpStatus.TOO_MANY_REQUESTS,
          'TOO_MANY_REQUESTS',
          'Too many login attempts. Try again later.',
        );
      }
    } catch (error) {
      if (isTooManyRequests(error)) {
        throw error;
      }

      this.logger.warn(
        'Login rate limit check failed; allowing the request',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async recordFailure(request: FastifyRequest): Promise<void> {
    const keys = this._keysFor(request);
    const ttl = this._windowSeconds();

    try {
      await Promise.all([this._bump(keys.ip, ttl), this._bump(keys.user, ttl)]);
    } catch (error) {
      this.logger.warn(
        'Failed to record a login attempt',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async recordSuccess(request: FastifyRequest): Promise<void> {
    const keys = this._keysFor(request);

    try {
      if (keys.user) {
        await this.redis.del(keys.user);
      }
    } catch (error) {
      this.logger.warn(
        'Failed to clear login attempts after success',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private _keysFor(request: FastifyRequest): {
    ip: string | null;
    user: string | null;
  } {
    const path = request.url ?? request.raw?.url ?? '';
    return loginAttemptKeys(
      loginPortalFromPath(path),
      extractClientIp(request),
      usernameFromLoginBody(request.body),
    );
  }

  private async _readCount(key: string | null): Promise<number> {
    if (!key) {
      return 0;
    }

    const raw = await this.redis.get(key);
    const count = Number(raw);
    return Number.isFinite(count) ? count : 0;
  }

  private async _bump(key: string | null, ttlSeconds: number): Promise<void> {
    if (!key) {
      return;
    }

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, ttlSeconds);
    }
  }

  private async _retryAfterSeconds(keys: {
    ip: string | null;
    user: string | null;
  }): Promise<number> {
    const ttls = await Promise.all([
      keys.ip ? this.redis.ttl(keys.ip) : Promise.resolve(-1),
      keys.user ? this.redis.ttl(keys.user) : Promise.resolve(-1),
    ]);
    const remaining = Math.max(0, ...ttls);
    return remaining > 0 ? remaining : this._windowSeconds();
  }

  private _userLimit(): number {
    return this.configService.get<number>(
      'LOGIN_ATTEMPT_USER_LIMIT',
      LOGIN_ATTEMPT_USER_LIMIT,
    );
  }

  private _ipLimit(): number {
    return this.configService.get<number>(
      'LOGIN_ATTEMPT_IP_LIMIT',
      LOGIN_ATTEMPT_IP_LIMIT,
    );
  }

  private _windowSeconds(): number {
    return this.configService.get<number>(
      'LOGIN_ATTEMPT_WINDOW_SECONDS',
      LOGIN_ATTEMPT_WINDOW_SECONDS,
    );
  }
}

function isTooManyRequests(error: unknown): boolean {
  return error instanceof HttpException && error.getStatus() === 429;
}
