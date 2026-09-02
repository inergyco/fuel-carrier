import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { DATABASE } from '../database/database.tokens';
import { REDIS } from '../redis/redis.tokens';
import { HealthService } from './health.service';
import { probeMqttBroker } from './mqtt-health.utils';

jest.mock('./mqtt-health.utils', () => ({
  probeMqttBroker: jest.fn(),
}));

describe('HealthService', () => {
  let service: HealthService;
  let databaseExecute: jest.Mock;
  let redisPing: jest.Mock;
  let configGet: jest.Mock;
  const mockProbeMqttBroker = probeMqttBroker as jest.MockedFunction<
    typeof probeMqttBroker
  >;

  beforeEach(async () => {
    databaseExecute = jest.fn().mockResolvedValue(undefined);
    redisPing = jest.fn().mockResolvedValue('PONG');
    configGet = jest.fn().mockReturnValue(undefined);
    mockProbeMqttBroker.mockReset();

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
        {
          provide: ConfigService,
          useValue: {
            get: configGet,
          },
        },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  it('returns ok when postgres and redis are reachable and mqtt is disabled', async () => {
    const result = await service.checkReadiness();

    expect(result).toEqual({
      status: 'ok',
      checks: {
        postgres: { status: 'up' },
        redis: { status: 'up' },
        mqtt: { status: 'skipped' },
      },
    });
    expect(databaseExecute).toHaveBeenCalledWith(sql`SELECT 1`);
    expect(redisPing).toHaveBeenCalled();
    expect(mockProbeMqttBroker).not.toHaveBeenCalled();
  });

  it('returns ok when postgres, redis, and mqtt are reachable', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'MQTT_URL') {
        return 'mqtt://127.0.0.1:1883';
      }

      if (key === 'MQTT_USERNAME') {
        return 'backend';
      }

      if (key === 'MQTT_PASSWORD') {
        return 'dev-backend-secret';
      }

      return undefined;
    });
    mockProbeMqttBroker.mockResolvedValue(undefined);

    const result = await service.checkReadiness();

    expect(result).toEqual({
      status: 'ok',
      checks: {
        postgres: { status: 'up' },
        redis: { status: 'up' },
        mqtt: { status: 'up' },
      },
    });
    expect(mockProbeMqttBroker).toHaveBeenCalledWith({
      url: 'mqtt://127.0.0.1:1883',
      username: 'backend',
      password: 'dev-backend-secret',
      timeoutMs: 3_000,
    });
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
    expect(result.checks.mqtt.status).toBe('skipped');
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
    expect(result.checks.mqtt.status).toBe('skipped');
  });

  it('returns error when redis responds with an unexpected value', async () => {
    redisPing.mockResolvedValue('NOPE');

    const result = await service.checkReadiness();

    expect(result.status).toBe('error');
    expect(result.checks.redis.message).toContain('Unexpected PING response');
  });

  it('returns error when mqtt is configured but the broker is unavailable', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'MQTT_URL') {
        return 'mqtt://127.0.0.1:1883';
      }

      if (key === 'MQTT_USERNAME') {
        return 'backend';
      }

      if (key === 'MQTT_PASSWORD') {
        return 'dev-backend-secret';
      }

      return undefined;
    });
    mockProbeMqttBroker.mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await service.checkReadiness();

    expect(result.status).toBe('error');
    expect(result.checks.mqtt).toEqual({
      status: 'down',
      message: 'ECONNREFUSED',
    });
    expect(result.checks.postgres.status).toBe('up');
    expect(result.checks.redis.status).toBe('up');
  });

  it('returns error when mqtt credentials are missing', async () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'MQTT_URL') {
        return 'mqtt://127.0.0.1:1883';
      }

      return undefined;
    });

    const result = await service.checkReadiness();

    expect(result.status).toBe('error');
    expect(result.checks.mqtt).toEqual({
      status: 'down',
      message:
        'MQTT_URL is set but MQTT_USERNAME / MQTT_PASSWORD are missing',
    });
  });
});
