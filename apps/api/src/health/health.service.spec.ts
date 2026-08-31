import { Test, TestingModule } from '@nestjs/testing';
import { sql } from 'drizzle-orm';
import { DATABASE } from '../database/database.tokens';
import { REDIS } from '../redis/redis.tokens';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let databaseExecute: jest.Mock;
  let redisPing: jest.Mock;

  beforeEach(async () => {
    databaseExecute = jest.fn().mockResolvedValue(undefined);
    redisPing = jest.fn().mockResolvedValue('PONG');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DATABASE,
          useValue: {
            execute: databaseExecute,
          },
        },
        {
          provide: REDIS,
          useValue: {
            ping: redisPing,
          },
        },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  it('returns ok when postgres and redis are reachable', async () => {
    const result = await service.checkReadiness();

    expect(result).toEqual({
      status: 'ok',
      checks: {
        postgres: { status: 'up' },
        redis: { status: 'up' },
      },
    });
    expect(databaseExecute).toHaveBeenCalledWith(sql`SELECT 1`);
    expect(redisPing).toHaveBeenCalled();
  });

  it('returns error when postgres is unavailable', async () => {
    databaseExecute.mockRejectedValue(new Error('connection refused'));

    const result = await service.checkReadiness();

    expect(result.status).toBe('error');
    expect(result.checks.postgres).toEqual({
      status: 'down',
      message: 'connection refused',
    });
    expect(result.checks.redis.status).toBe('up');
  });

  it('returns error when redis is unavailable', async () => {
    redisPing.mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await service.checkReadiness();

    expect(result.status).toBe('error');
    expect(result.checks.redis).toEqual({
      status: 'down',
      message: 'ECONNREFUSED',
    });
    expect(result.checks.postgres.status).toBe('up');
  });

  it('returns error when redis responds with an unexpected value', async () => {
    redisPing.mockResolvedValue('NOPE');

    const result = await service.checkReadiness();

    expect(result.status).toBe('error');
    expect(result.checks.redis.message).toContain('Unexpected PING response');
  });
});
