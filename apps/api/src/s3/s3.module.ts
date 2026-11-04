import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { S3Client } from '@aws-sdk/client-s3';
import type { Env } from '../config/env.schema';
import { S3StorageService } from './s3-storage.service';
import { S3_CLIENT } from './s3.tokens';

@Global()
@Module({
  providers: [
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory(configService: ConfigService<Env, true>): S3Client | null {
        const endpoint = configService.get('S3_ENDPOINT', { infer: true });
        if (!endpoint) {
          return null;
        }

        return new S3Client({
          endpoint,
          region: configService.getOrThrow('S3_REGION', { infer: true }),
          credentials: {
            accessKeyId: configService.getOrThrow('S3_ACCESS_KEY_ID', {
              infer: true,
            }),
            secretAccessKey: configService.getOrThrow('S3_SECRET_ACCESS_KEY', {
              infer: true,
            }),
          },
          forcePathStyle: true,
        });
      },
    },
    S3StorageService,
  ],
  exports: [S3_CLIENT, S3StorageService],
})
export class S3Module implements OnApplicationShutdown {
  constructor(private readonly moduleRef: ModuleRef) {}

  onApplicationShutdown(): void {
    const client = this.moduleRef.get<S3Client | null>(S3_CLIENT, {
      strict: false,
    });
    client?.destroy();
  }
}
