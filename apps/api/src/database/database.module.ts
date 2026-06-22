import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE } from './database.tokens';
import type { Database } from './database.types';
import { TenantDbService } from './tenant-db.service';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      inject: [ConfigService],
      useFactory(configService: ConfigService): Database {
        const connectionString =
          configService.getOrThrow<string>('DATABASE_URL');
        const pool = new Pool({ connectionString });
        return drizzle(pool, { schema });
      },
    },
    TenantDbService,
  ],
  exports: [DATABASE, TenantDbService],
})
export class DatabaseModule {}
