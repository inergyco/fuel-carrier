import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  COMPANY_LOGO_MAX_BYTES,
  COMPANY_LOGO_MULTIPART_BODY_LIMIT,
  COMPANY_LOGO_PUBLIC_PREFIX,
} from './company-logo.constants';
import {
  ensureCompanyLogoDirectory,
  getCompanyLogoDirectory,
} from './company-logo-storage';

export { COMPANY_LOGO_MULTIPART_BODY_LIMIT };

export async function setupCompanyLogoUploads(
  app: NestFastifyApplication,
): Promise<void> {
  await ensureCompanyLogoDirectory();

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: COMPANY_LOGO_MAX_BYTES,
      files: 1,
    },
  });

  await app.register(fastifyStatic, {
    root: getCompanyLogoDirectory(),
    prefix: `${COMPANY_LOGO_PUBLIC_PREFIX}/`,
    decorateReply: false,
    index: false,
    list: false,
    dotfiles: 'deny',
    setHeaders: function setCompanyLogoHeaders(response) {
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      );
      response.setHeader('Cache-Control', 'public, max-age=86400');
    },
  });
}
