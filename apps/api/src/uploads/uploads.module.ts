import { Global, Module } from '@nestjs/common';
import { S3StorageService } from '../s3/s3-storage.service';
import {
  COMPANY_LOGO_PUBLIC_PREFIX,
  COMPANY_USER_IMAGE_PUBLIC_PREFIX,
  DRIVER_IMAGE_PUBLIC_PREFIX,
} from './image-upload.constants';
import { createImageStorage, type ImageObjectStore } from './image-storage';
import {
  COMPANY_LOGO_STORAGE,
  COMPANY_USER_IMAGE_STORAGE,
  DRIVER_IMAGE_STORAGE,
} from './image-storage.tokens';
import { ImageUrlService } from './image-url.service';

@Global()
@Module({
  providers: [
    ImageUrlService,
    {
      provide: COMPANY_LOGO_STORAGE,
      inject: [S3StorageService],
      useFactory: function createCompanyLogoStorage(s3: S3StorageService) {
        return createImageStorage({
          folderName: 'company-logos',
          publicPrefix: COMPANY_LOGO_PUBLIC_PREFIX,
          invalidMessage: 'Logo must be a PNG, JPG, WEBP, GIF, or SVG image',
          objectStore: toObjectStore(s3),
        });
      },
    },
    {
      provide: COMPANY_USER_IMAGE_STORAGE,
      inject: [S3StorageService],
      useFactory: function createCompanyUserImageStorage(s3: S3StorageService) {
        return createImageStorage({
          folderName: 'company-user-images',
          publicPrefix: COMPANY_USER_IMAGE_PUBLIC_PREFIX,
          invalidMessage: 'Image must be a PNG, JPG, WEBP, GIF, or SVG file',
          objectStore: toObjectStore(s3),
        });
      },
    },
    {
      provide: DRIVER_IMAGE_STORAGE,
      inject: [S3StorageService],
      useFactory: function createDriverImageStorage(s3: S3StorageService) {
        return createImageStorage({
          folderName: 'driver-images',
          publicPrefix: DRIVER_IMAGE_PUBLIC_PREFIX,
          invalidMessage: 'Image must be a PNG, JPG, WEBP, GIF, or SVG file',
          objectStore: toObjectStore(s3),
        });
      },
    },
  ],
  exports: [
    ImageUrlService,
    COMPANY_LOGO_STORAGE,
    COMPANY_USER_IMAGE_STORAGE,
    DRIVER_IMAGE_STORAGE,
  ],
})
export class UploadsModule {}

function toObjectStore(s3: S3StorageService): ImageObjectStore | null {
  if (!s3.isEnabled()) {
    return null;
  }

  return {
    put: (options) => s3.putObject(options),
    delete: (key) => s3.deleteObject(key),
  };
}
