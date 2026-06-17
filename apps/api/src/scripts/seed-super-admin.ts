import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { parseZodValue } from '../common/validation/zod.utils';
import { hashPassword } from '../auth/password.utils';
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

    if (existingAdmin) {
      throw new Error(
        `Admin with username "${env.SUPER_ADMIN_USERNAME}" already exists`,
      );
    }

    const passwordHash = await hashPassword(env.SUPER_ADMIN_PASSWORD);

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
  } finally {
    await pool.end();
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
