import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';
import {
  IMAGE_UPLOAD_MULTIPART_BODY_LIMIT,
  setupImageUploads,
} from './uploads/setup-image-uploads';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { REQUEST_ID_HEADER, assignRequestId } from './common/logging';
import type { Env } from './config/env.schema';
import { setupCors } from './security/cors.setup';
import { setupSecurityHeaders } from './security/security-headers.setup';
import { ConfigurableIoAdapter } from './security/socket-io.adapter';
import { setupSwagger } from './swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      requestIdHeader: REQUEST_ID_HEADER,
      genReqId: assignRequestId,
      bodyLimit: IMAGE_UPLOAD_MULTIPART_BODY_LIMIT,
    }),
    { bufferLogs: true },
  );
  app.useLogger(app.get(Logger));
  // Listen for SIGTERM/SIGINT so Nest runs OnModuleDestroy / OnApplicationShutdown
  // (MQTT, Redis subscriber, DB pool) instead of hard-killing the process.
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  const allowedOrigins = configService.getOrThrow<Env['CORS_ALLOWED_ORIGINS']>(
    'CORS_ALLOWED_ORIGINS',
  );

  app.useWebSocketAdapter(new ConfigurableIoAdapter(app, allowedOrigins));
  await setupSecurityHeaders(app);
  await setupCors(app);
  await app.register(fastifyCookie);
  await setupImageUploads(app);

  // Echo request id so browsers/DevTools can show it on every response.
  const fastify = app.getHttpAdapter().getInstance();
  fastify.addHook('onRequest', function echoRequestId(request, reply, done) {
    const id =
      typeof request.id === 'string' && request.id.length > 0
        ? request.id
        : undefined;
    if (id) {
      void reply.header(REQUEST_ID_HEADER, id);
    }
    done();
  });

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalFilters(app.get(ApiExceptionFilter));
  setupSwagger(app);
  await app.listen(
    configService.getOrThrow<number>('PORT'),
    configService.getOrThrow<string>('HOST'),
  );
}

void bootstrap();
