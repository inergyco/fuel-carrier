import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import type { Env } from './config/env.schema';
import { setupCors } from './security/cors.setup';
import { setupSecurityHeaders } from './security/security-headers.setup';
import { ConfigurableIoAdapter } from './security/socket-io.adapter';
import { setupSwagger } from './swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);

  const allowedOrigins = configService.getOrThrow<Env['CORS_ALLOWED_ORIGINS']>(
    'CORS_ALLOWED_ORIGINS',
  );

  app.useWebSocketAdapter(new ConfigurableIoAdapter(app, allowedOrigins));
  await setupSecurityHeaders(app);
  await setupCors(app);
  await app.register(fastifyCookie);
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());
  setupSwagger(app);
  await app.listen(
    configService.getOrThrow<number>('PORT'),
    configService.getOrThrow<string>('HOST'),
  );
}
void bootstrap();
