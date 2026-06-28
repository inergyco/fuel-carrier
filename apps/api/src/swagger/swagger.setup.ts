import { type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExternalModule } from '../external/external.module';
import { InternalModule } from '../internal/internal.module';
import { AUTH_COOKIE_SCHEME } from './swagger.constants';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED', 'true');

  if (swaggerEnabled !== 'true') {
    return;
  }

  const internalCookieName = configService.getOrThrow<string>(
    'INTERNAL_AUTH_COOKIE_NAME',
  );
  const externalCookieName = configService.getOrThrow<string>(
    'EXTERNAL_AUTH_COOKIE_NAME',
  );

  const internalDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Fuel Carrier Internal API')
      .setDescription('Admin and internal panel operations')
      .setVersion('1.0')
      .addCookieAuth(AUTH_COOKIE_SCHEME, {
        type: 'apiKey',
        in: 'cookie',
        name: internalCookieName,
      })
      .build(),
    { include: [InternalModule] },
  );

  SwaggerModule.setup('api/docs/internal', app, internalDocument, {
    jsonDocumentUrl: 'api/docs/internal/json',
  });

  const externalDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Fuel Carrier External API')
      .setDescription('Public and customer-facing operations')
      .setVersion('1.0')
      .addCookieAuth(AUTH_COOKIE_SCHEME, {
        type: 'apiKey',
        in: 'cookie',
        name: externalCookieName,
      })
      .build(),
    { include: [ExternalModule] },
  );

  SwaggerModule.setup('api/docs/external', app, externalDocument, {
    jsonDocumentUrl: 'api/docs/external/json',
  });
}
