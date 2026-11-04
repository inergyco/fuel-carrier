import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  COMPANY_LOGO_PUBLIC_PREFIX,
  COMPANY_USER_IMAGE_PUBLIC_PREFIX,
  DRIVER_IMAGE_PUBLIC_PREFIX,
  IMAGE_UPLOAD_MAX_BYTES,
} from './image-upload.constants';
import type { ImageStorage } from './image-storage';

export { IMAGE_UPLOAD_MULTIPART_BODY_LIMIT } from './image-upload.constants';

export type SetupImageUploadsOptions = {
  companyLogoStorage: ImageStorage;
  companyUserImageStorage: ImageStorage;
  driverImageStorage: ImageStorage;
};

export async function setupImageUploads(
  app: NestFastifyApplication,
  storages: SetupImageUploadsOptions,
): Promise<void> {
  await storages.companyLogoStorage.ensureDirectory();
  await storages.companyUserImageStorage.ensureDirectory();
  await storages.driverImageStorage.ensureDirectory();

  await app.register(fastifyMultipart, {
    limits: {
      fileSize: IMAGE_UPLOAD_MAX_BYTES,
      files: 1,
    },
  });

  await registerStaticRoot(app, {
    directory: storages.companyLogoStorage.getDirectory(),
    prefix: `${COMPANY_LOGO_PUBLIC_PREFIX}/`,
  });

  await registerStaticRoot(app, {
    directory: storages.companyUserImageStorage.getDirectory(),
    prefix: `${COMPANY_USER_IMAGE_PUBLIC_PREFIX}/`,
  });

  await registerStaticRoot(app, {
    directory: storages.driverImageStorage.getDirectory(),
    prefix: `${DRIVER_IMAGE_PUBLIC_PREFIX}/`,
  });
}

async function registerStaticRoot(
  app: NestFastifyApplication,
  options: { directory: string; prefix: string },
): Promise<void> {
  await app.register(fastifyStatic, {
    root: options.directory,
    prefix: options.prefix,
    decorateReply: false,
    index: false,
    list: false,
    dotfiles: 'deny',
    setHeaders: function setImageUploadHeaders(response) {
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      );
      response.setHeader('Cache-Control', 'public, max-age=86400');
    },
  });
}
