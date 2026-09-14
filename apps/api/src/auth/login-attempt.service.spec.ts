import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiErrorCode } from '@fuel-carrier/shared-types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ApiException } from '../common/exceptions/api.exception';
import { LoginAttemptService } from './login-attempt.service';

describe('LoginAttemptService.assertAllowed', () => {
  let service: LoginAttemptService;
  let redisGet: jest.Mock;
  let replyHeader: jest.Mock;

  beforeEach(() => {
    redisGet = jest.fn();
    replyHeader = jest.fn();
    service = new LoginAttemptService(
      {
        get: redisGet,
        incr: jest.fn(),
        expire: jest.fn(),
        del: jest.fn(),
        ttl: jest.fn().mockResolvedValue(30),
      } as never,
      {
        get: (_key: string, fallback: number) => fallback,
      } as unknown as ConfigService,
    );
  });

  function request(): FastifyRequest {
    return {
      url: '/api/external/auth/login',
      body: { username: 'pars_admin', password: 'x' },
      headers: {},
      ip: '127.0.0.1',
    } as FastifyRequest;
  }

  function reply(): FastifyReply {
    return { header: replyHeader } as unknown as FastifyReply;
  }

  it('allows login when counters are under the limit', async () => {
    redisGet.mockResolvedValue('0');
    await expect(
      service.assertAllowed(request(), reply()),
    ).resolves.toBeUndefined();
  });

  it('rejects with 429 when the user counter is over the limit', async () => {
    redisGet.mockImplementation(async (key: string) => {
      if (String(key).includes(':user:')) {
        return '100';
      }
      return '0';
    });

    try {
      await service.assertAllowed(request(), reply());
      throw new Error('expected assertAllowed to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).getStatus()).toBe(
        HttpStatus.TOO_MANY_REQUESTS,
      );
      expect((error as ApiException).getResponse()).toMatchObject({
        code: ApiErrorCode.TOO_MANY_REQUESTS,
      });
    }
  });

  it('fails closed with 503 when Redis errors', async () => {
    redisGet.mockRejectedValue(new Error('redis down'));

    try {
      await service.assertAllowed(request(), reply());
      throw new Error('expected assertAllowed to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).getStatus()).toBe(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect((error as ApiException).getResponse()).toMatchObject({
        code: ApiErrorCode.INTERNAL_ERROR,
      });
    }
  });
});
