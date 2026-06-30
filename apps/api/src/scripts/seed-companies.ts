import 'dotenv/config';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { parseZodValue } from '../common/validation/zod.utils';
import { hashPassword } from '../auth/password.utils';
import { companies } from '../database/schema/companies';
import { companyUsers } from '../database/schema/company-users';
import { users } from '../database/schema/users';
import { drivers } from '../database/schema/drivers';
import { cars } from '../database/schema/cars';
import * as schema from '../database/schema';
import type { TenantTransaction } from '../database/tenant-db.types';
import {
  seedCompaniesDtoSchema,
  type SeedCompaniesDto,
} from './dto/seed-companies.dto';
import {
  SEED_COMPANIES,
  SEED_MARKER_NATIONAL_ID,
  type SeedCompany,
} from './seed-companies.data';

async function seedCompanies(): Promise<void> {
  const env = parseSeedEnv();
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    const [existingCompany] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.nationalId, SEED_MARKER_NATIONAL_ID))
      .limit(1);

    if (existingCompany) {
      await db.transaction(async (tx) => {
        await applyInternalContext(tx);
        await syncExistingSeedCompanies(tx);
      });

      console.log(
        `Seed companies already exist. Synced ${SEED_COMPANIES.length} company profiles (including logos).`,
      );
      return;
    }

    const passwordHash = await hashPassword(env.SEED_COMPANY_PASSWORD);

    await db.transaction(async (tx) => {
      await applyInternalContext(tx);

      for (const companySeed of SEED_COMPANIES) {
        await seedCompany(tx, companySeed, passwordHash);
      }
    });

    console.log(
      `Seeded ${SEED_COMPANIES.length} companies with users, drivers, and cars.`,
    );
    console.log(
      `Company user password (all accounts): ${env.SEED_COMPANY_PASSWORD}`,
    );
  } finally {
    await pool.end();
  }
}

async function seedCompany(
  tx: TenantTransaction,
  companySeed: SeedCompany,
  passwordHash: string,
): Promise<void> {
  const [company] = await tx
    .insert(companies)
    .values({
      name: companySeed.name,
      nationalId: companySeed.nationalId,
      phoneNumber: companySeed.phoneNumber,
      address: companySeed.address,
      note: companySeed.note,
      logoUrl: companySeed.logoUrl ?? null,
    })
    .returning({ id: companies.id });

  for (const userSeed of companySeed.users) {
    const [user] = await tx
      .insert(users)
      .values({
        firstName: userSeed.firstName,
        lastName: userSeed.lastName,
      })
      .returning({ id: users.id });

    await tx.insert(companyUsers).values({
      userId: user.id,
      companyId: company.id,
      username: userSeed.username,
      nationalId: userSeed.nationalId,
      email: userSeed.email,
      passwordHash,
      level: userSeed.level,
      mustChangePassword: false,
    });
  }

  const driverIds: string[] = [];

  for (const driverSeed of companySeed.drivers) {
    const [driver] = await tx
      .insert(drivers)
      .values({
        firstName: driverSeed.firstName,
        lastName: driverSeed.lastName,
        nationalId: driverSeed.nationalId,
        companyId: company.id,
      })
      .returning({ id: drivers.id });

    driverIds.push(driver.id);
  }

  for (const carSeed of companySeed.cars) {
    const driverId =
      carSeed.driverIndex !== undefined ? driverIds[carSeed.driverIndex] : null;

    await tx.insert(cars).values({
      name: carSeed.name,
      licensePlate: carSeed.licensePlate,
      companyId: company.id,
      driverId,
      note: carSeed.note ?? null,
    });
  }

  console.log(`  ✓ ${companySeed.name}`);
}

async function syncExistingSeedCompanies(tx: TenantTransaction): Promise<void> {
  for (const companySeed of SEED_COMPANIES) {
    const [company] = await tx
      .update(companies)
      .set({
        name: companySeed.name,
        phoneNumber: companySeed.phoneNumber,
        address: companySeed.address,
        note: companySeed.note,
        logoUrl: companySeed.logoUrl ?? null,
      })
      .where(eq(companies.nationalId, companySeed.nationalId))
      .returning({ id: companies.id });

    if (!company) {
      console.warn(
        `  ! Skipped ${companySeed.name} (national ID "${companySeed.nationalId}" not found)`,
      );
      continue;
    }

    console.log(`  ↻ ${companySeed.name}`);
  }
}

async function applyInternalContext(tx: TenantTransaction): Promise<void> {
  await tx.execute(sql`SELECT set_config('app.is_internal', 'true', true)`);
}

function parseSeedEnv(): SeedCompaniesDto {
  const raw = {
    DATABASE_URL: process.env.DATABASE_URL,
    SEED_COMPANY_PASSWORD:
      process.env.SEED_COMPANY_PASSWORD ?? 'SeedCompany1!Strong',
  };

  try {
    return parseZodValue(seedCompaniesDtoSchema, raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid seed environment variables:\n${message}`);
  }
}

seedCompanies().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to seed companies: ${message}`);
  process.exit(1);
});
