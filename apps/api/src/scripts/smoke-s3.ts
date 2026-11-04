import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { validateEnv } from '../config/env.schema';
import { S3Module } from '../s3/s3.module';
import { S3StorageService } from '../s3/s3-storage.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    S3Module,
  ],
})
class SmokeS3Module {}

async function smokeS3(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SmokeS3Module, {
    logger: ['error', 'warn'],
  });

  try {
    const s3 = app.get(S3StorageService);
    if (!s3.isEnabled()) {
      throw new Error(
        'S3 is not enabled — check S3_* env vars in apps/api/.env',
      );
    }

    const key = `test/nest-smoke-${Date.now()}.txt`;
    const body = Buffer.from('fuel-carrier nest s3 smoke', 'utf8');

    await s3.putObject({
      key,
      body,
      contentType: 'text/plain; charset=utf-8',
    });
    console.log(`putObject OK → ${key}`);

    const signedUrl = await s3.getSignedGetUrl(key);
    console.log(`signed URL OK → ${signedUrl.slice(0, 80)}…`);

    await s3.deleteObject(key);
    console.log('deleteObject OK');
  } finally {
    await app.close();
  }
}

void smokeS3().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
