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
import { setupSecurityHeaders } from './security/security-headers.setup';
import { setupSwagger } from './swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);

  await setupSecurityHeaders(app);
  await app.register(fastifyCookie);
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());
  setupSwagger(app);
  await app.listen(configService.getOrThrow<number>('PORT'), '0.0.0.0');
}
void bootstrap();
