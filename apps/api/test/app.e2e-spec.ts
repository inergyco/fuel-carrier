import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ApiExceptionFilter } from './../src/common/filters/api-exception.filter';
import { ApiResponseInterceptor } from './../src/common/interceptors/api-response.interceptor';
import { setupSecurityHeaders } from './../src/security/security-headers.setup';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await setupSecurityHeaders(app);
    await app.register(fastifyCookie);
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/api/health/live (GET) includes security headers', () => {
    return request(app.getHttpServer())
      .get('/api/health/live')
      .expect(200)
      .expect('x-content-type-options', 'nosniff')
      .expect('x-frame-options', 'DENY')
      .expect('referrer-policy', 'no-referrer')
      .expect('cross-origin-resource-policy', 'cross-origin');
  });

  it('/api/health/live (GET) returns liveness without envelope', () => {
    return request(app.getHttpServer())
      .get('/api/health/live')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/api/health/ready (GET) returns readiness without envelope', async () => {
    const response = await request(app.getHttpServer()).get('/api/health/ready');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.checks.postgres.status).toBe('up');
    expect(response.body.checks.redis.status).toBe('up');
  });

  it('/api/internal/companies (GET) returns an unauthorized error envelope', () => {
    return request(app.getHttpServer())
      .get('/api/internal/companies')
      .expect(401)
      .expect({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        },
      });
  });

  it('/api/internal/auth/me (GET) returns an unauthorized error envelope', () => {
    return request(app.getHttpServer())
      .get('/api/internal/auth/me')
      .expect(401)
      .expect({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        },
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
