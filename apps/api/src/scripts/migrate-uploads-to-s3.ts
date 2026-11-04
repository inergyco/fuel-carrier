import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { validateEnv } from '../config/env.schema';
import { S3Module } from '../s3/s3.module';
import { S3StorageService } from '../s3/s3-storage.service';

const UPLOAD_FOLDERS = [
  'company-logos',
  'company-user-images',
  'driver-images',
] as const;

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

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
class MigrateUploadsModule {}

async function migrateUploadsToS3(): Promise<void> {
  const app = await NestFactory.createApplicationContext(MigrateUploadsModule, {
    logger: ['error', 'warn'],
  });

  try {
    const s3 = app.get(S3StorageService);
    if (!s3.isEnabled()) {
      throw new Error(
        'S3 is not enabled — set S3_* env vars in apps/api/.env first',
      );
    }

    const uploadsRoot = path.join(process.cwd(), 'uploads');
    let uploaded = 0;
    let skipped = 0;

    for (const folder of UPLOAD_FOLDERS) {
      const folderPath = path.join(uploadsRoot, folder);
      const folderStat = await stat(folderPath).catch(() => null);
      if (!folderStat?.isDirectory()) {
        console.log(`skip missing folder → ${folder}`);
        continue;
      }

      const fileNames = await readdir(folderPath);
      for (const fileName of fileNames) {
        const filePath = path.join(folderPath, fileName);
        const fileStat = await stat(filePath);
        if (!fileStat.isFile()) {
          skipped += 1;
          continue;
        }

        const extension = path.extname(fileName).slice(1).toLowerCase();
        const contentType =
          CONTENT_TYPE_BY_EXTENSION[extension] ?? 'application/octet-stream';
        const key = `${folder}/${fileName}`;
        const body = await readFile(filePath);

        await s3.putObject({ key, body, contentType });
        uploaded += 1;
        console.log(`uploaded → ${key}`);
      }
    }

    console.log(`done. uploaded=${uploaded} skipped=${skipped}`);
  } finally {
    await app.close();
  }
}

void migrateUploadsToS3().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
