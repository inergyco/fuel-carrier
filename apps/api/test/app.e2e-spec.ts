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

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.register(fastifyCookie);
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/api (GET) returns a success envelope', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect({
        data: {
          id: '1',
          name: 'Fuel Carrier',
        },
      });
  });

  it('/api/auth/me (GET) returns an unauthorized error envelope', () => {
    return request(app.getHttpServer())
      .get('/api/auth/me')
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
