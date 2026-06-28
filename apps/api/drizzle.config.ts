import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const migrationDatabaseUrl =
  process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;

if (!migrationDatabaseUrl) {
  throw new Error(
    'MIGRATION_DATABASE_URL or DATABASE_URL is required for drizzle-kit',
  );
}

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: migrationDatabaseUrl,
  },
});
