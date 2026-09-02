import { ConfigService } from '@nestjs/config';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import cors from '@fastify/cors';
import type { Env } from '../config/env.schema';

export async function setupCors(app: NestFastifyApplication): Promise<void> {
  const configService = app.get(ConfigService);
  const allowedOrigins = configService.getOrThrow<Env['CORS_ALLOWED_ORIGINS']>(
    'CORS_ALLOWED_ORIGINS',
  );

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });
}
