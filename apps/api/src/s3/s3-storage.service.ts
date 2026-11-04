import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema';
import { S3_CLIENT } from './s3.tokens';

export type S3PutObjectOptions = {
  key: string;
  body: Buffer;
  contentType: string;
};

@Injectable()
export class S3StorageService {
  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client | null,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  isEnabled(): boolean {
    return this.client !== null;
  }

  async putObject(options: S3PutObjectOptions): Promise<void> {
    const client = this._requireClient();
    const cacheSeconds = this._getSignedUrlWindowSeconds();

    await client.send(
      new PutObjectCommand({
        Bucket: this._getBucket(),
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        // Lets Arvan/CDN reuse the response while the signed query string stays stable.
        CacheControl: `public, max-age=${cacheSeconds}`,
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    const client = this._requireClient();

    await client.send(
      new DeleteObjectCommand({
        Bucket: this._getBucket(),
        Key: key,
      }),
    );
  }

  async getSignedGetUrl(key: string): Promise<string> {
    const client = this._requireClient();
    const windowSeconds = this._getSignedUrlWindowSeconds();
    const signingDate = floorToSigningWindow(windowSeconds);

    return getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: this._getBucket(),
        Key: key,
      }),
      {
        // Same window → same URL for every API instance / request.
        // 2× window so links stay valid until the next window starts.
        signingDate,
        expiresIn: windowSeconds * 2,
      },
    );
  }

  private _requireClient(): S3Client {
    if (!this.client) {
      throw new Error(
        'S3 is not configured. Set S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.',
      );
    }

    return this.client;
  }

  private _getBucket(): string {
    return this.configService.getOrThrow('S3_BUCKET', { infer: true });
  }

  private _getSignedUrlWindowSeconds(): number {
    return this.configService.get('S3_SIGNED_URL_EXPIRES_SECONDS', {
      infer: true,
    });
  }
}

function floorToSigningWindow(windowSeconds: number): Date {
  const windowMs = windowSeconds * 1000;
  return new Date(Math.floor(Date.now() / windowMs) * windowMs);
}
