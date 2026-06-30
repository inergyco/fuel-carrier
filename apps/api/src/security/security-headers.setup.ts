import { ConfigService } from '@nestjs/config';
import { type NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';

export async function setupSecurityHeaders(
  app: NestFastifyApplication,
): Promise<void> {
  const configService = app.get(ConfigService);
  const swaggerEnabled =
    configService.get<string>('SWAGGER_ENABLED', 'true') === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  await app.register(helmet, {
    contentSecurityPolicy: swaggerEnabled
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: isProduction
      ? {
          maxAge: 31_536_000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: { action: 'deny' },
  });
}
