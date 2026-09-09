import {
  Global,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE } from './database.tokens';
import type { Database } from './database.types';
import { TenantDbService } from './tenant-db.service';
import * as schema from './schema';

@Injectable()
class DatabasePool implements OnApplicationShutdown {
  readonly pool: Pool;

  constructor(configService: ConfigService) {
    this.pool = new Pool({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

@Global()
@Module({
  providers: [
    DatabasePool,
    {
      provide: DATABASE,
      inject: [DatabasePool],
      useFactory(databasePool: DatabasePool): Database {
        return drizzle(databasePool.pool, { schema });
      },
    },
    TenantDbService,
  ],
  exports: [DATABASE, TenantDbService],
})
export class DatabaseModule {}
