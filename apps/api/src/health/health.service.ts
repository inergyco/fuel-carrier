import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type Redis from 'ioredis';
import { DATABASE } from '../database/database.tokens';
import type { Database } from '../database/database.types';
import { REDIS } from '../redis/redis.tokens';
import type {
  DependencyCheck,
  ReadinessChecks,
  ReadinessResult,
} from './health.types';
import { formatReadinessFailure } from './health.utils';

const PROBE_TIMEOUT_MS = 3_000;

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @Inject(DATABASE) private readonly database: Database,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async checkReadiness(): Promise<ReadinessResult> {
    const [postgres, redis] = await Promise.all([
      this._checkPostgres(),
      this._checkRedis(),
    ]);
    const checks: ReadinessChecks = { postgres, redis };
    const status = this._isReady(checks) ? 'ok' : 'error';

    if (status === 'error') {
      this.logger.error(
        `Readiness check failed: ${formatReadinessFailure({ status, checks })}`,
      );
    }

    return { status, checks };
  }

  private _isReady(checks: ReadinessChecks): boolean {
    return Object.values(checks).every((check) => check.status === 'up');
  }

  private async _checkPostgres(): Promise<DependencyCheck> {
    try {
      await withTimeout(this.database.execute(sql`SELECT 1`), PROBE_TIMEOUT_MS);
      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        message: toErrorMessage(error),
      };
    }
  }

  private async _checkRedis(): Promise<DependencyCheck> {
    try {
      const response = await withTimeout(this.redis.ping(), PROBE_TIMEOUT_MS);

      if (response !== 'PONG') {
        return {
          status: 'down',
          message: `Unexpected PING response: ${String(response)}`,
        };
      }

      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        message: toErrorMessage(error),
      };
    }
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(function rejectProbeTimeout() {
          reject(new Error(`Timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
