import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { parseZodValue } from '../common/validation/zod.utils';
import { hashPassword } from '../auth/password.utils';
import { loginAttemptKeys } from '../auth/login-attempt.constants';
import { admins } from '../database/schema/admins';
import { users } from '../database/schema/users';
import * as schema from '../database/schema';
import {
  seedSuperAdminDtoSchema,
  type SeedSuperAdminDto,
} from './dto/seed-super-admin.dto';

async function seedSuperAdmin(): Promise<void> {
  const env = parseSeedEnv();
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    const [existingAdmin] = await db
      .select({ id: admins.id })
      .from(admins)
      .where(eq(admins.username, env.SUPER_ADMIN_USERNAME))
      .limit(1);

    const passwordHash = await hashPassword(env.SUPER_ADMIN_PASSWORD);

    if (existingAdmin) {
      await db
        .update(admins)
        .set({ passwordHash })
        .where(eq(admins.username, env.SUPER_ADMIN_USERNAME));

      console.log(
        `Super admin "${env.SUPER_ADMIN_USERNAME}" password synced from environment.`,
      );
    } else {
      await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({
            firstName: env.SUPER_ADMIN_FIRST_NAME,
            lastName: env.SUPER_ADMIN_LAST_NAME,
          })
          .returning({ id: users.id });

        await tx.insert(admins).values({
          userId: user.id,
          username: env.SUPER_ADMIN_USERNAME,
          passwordHash,
        });
      });

      console.log(
        `Super admin "${env.SUPER_ADMIN_USERNAME}" created successfully.`,
      );
    }

    await clearInternalLoginAttempts(env.SUPER_ADMIN_USERNAME);
  } finally {
    await pool.end();
  }
}

async function clearInternalLoginAttempts(username: string): Promise<void> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return;
  }

  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 3 });

  try {
    const keys = loginAttemptKeys('internal', null, username);
    if (keys.user) {
      await redis.del(keys.user);
      console.log(`Cleared internal login attempts for "${username}".`);
    }
  } finally {
    await redis.quit();
  }
}

function parseSeedEnv(): SeedSuperAdminDto {
  try {
    return parseZodValue(seedSuperAdminDtoSchema, process.env);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid seed environment variables:\n${message}`);
  }
}

seedSuperAdmin().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to seed super admin: ${message}`);
  process.exit(1);
});
