import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema';
import { S3StorageService } from '../s3/s3-storage.service';
import {
  COMPANY_LOGO_PUBLIC_PREFIX,
  COMPANY_USER_IMAGE_PUBLIC_PREFIX,
  DRIVER_IMAGE_PUBLIC_PREFIX,
} from './image-upload.constants';

const FILE_NAME =
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(png|jpg|webp|gif|svg)';

const FOLDERS = [
  COMPANY_LOGO_PUBLIC_PREFIX,
  COMPANY_USER_IMAGE_PUBLIC_PREFIX,
  DRIVER_IMAGE_PUBLIC_PREFIX,
]
  .map((prefix) => prefix.slice('/api/uploads/'.length))
  .join('|');

const STORED_PATH_RE = new RegExp(
  `^/api/uploads/(${FOLDERS})/(${FILE_NAME})$`,
  'i',
);

@Injectable()
export class ImageUrlService {
  private readonly endpointHost: string | null;
  private readonly bucket: string | null;

  constructor(
    private readonly s3: S3StorageService,
    configService: ConfigService<Env, true>,
  ) {
    const endpoint = configService.get('S3_ENDPOINT', { infer: true });
    this.bucket = configService.get('S3_BUCKET', { infer: true }) ?? null;
    this.endpointHost = endpoint ? safeUrlHost(endpoint) : null;
  }

  /** DB writes: stable `/api/uploads/...` (also unwraps our signed Arvan URLs). */
  normalizeToStored(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) {
      return null;
    }

    const stored = matchStoredPath(imageUrl);
    if (stored) {
      return stored.path;
    }

    const fromSigned = this.matchSignedObject(imageUrl);
    return fromSigned?.path ?? imageUrl;
  }

  /** API responses / <img src>: sign our stored paths only. */
  signStored(imageUrl: string): Promise<string>;
  signStored(imageUrl: string | null | undefined): Promise<string | null>;
  async signStored(
    imageUrl: string | null | undefined,
  ): Promise<string | null> {
    if (!imageUrl) {
      return null;
    }

    if (!this.s3.isEnabled()) {
      return imageUrl;
    }

    const stored = matchStoredPath(imageUrl);
    if (!stored) {
      return imageUrl;
    }

    return this.s3.getSignedGetUrl(stored.key);
  }

  private matchSignedObject(
    imageUrl: string,
  ): { path: string; key: string } | null {
    if (!this.endpointHost || !this.bucket) {
      return null;
    }

    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return null;
    }

    if (url.host !== this.endpointHost) {
      return null;
    }

    const parts = url.pathname.split('/').filter(Boolean);
    const keyParts =
      parts.length === 3 && parts[0] === this.bucket
        ? parts.slice(1)
        : parts.length === 2
          ? parts
          : null;

    if (!keyParts) {
      return null;
    }

    return matchStoredPath(`/api/uploads/${keyParts[0]}/${keyParts[1]}`);
  }
}

function matchStoredPath(
  imageUrl: string,
): { path: string; key: string } | null {
  const match = STORED_PATH_RE.exec(imageUrl);
  if (!match) {
    return null;
  }

  const [, folder, fileName] = match;
  return {
    path: `/api/uploads/${folder}/${fileName}`,
    key: `${folder}/${fileName}`,
  };
}

function safeUrlHost(value: string): string | null {
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}
