import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { cars } from '../database/schema/cars';
import * as schema from '../database/schema';
import { writeCityTrajectory } from './write-city-trajectory';

async function seedCarTrajectories(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });
  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 3 });

  try {
    const fleet = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT set_config('app.is_internal', 'true', true)`);
      return tx
        .select({
          id: cars.id,
          companyId: cars.companyId,
          licensePlate: cars.licensePlate,
          name: cars.name,
        })
        .from(cars);
    });

    let updatedCars = 0;
    let insertedPoints = 0;

    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT set_config('app.is_internal', 'true', true)`);

      for (const car of fleet) {
        const pointCount = await writeCityTrajectory(tx, redis, {
          companyId: car.companyId,
          carId: car.id,
          licensePlate: car.licensePlate,
          fallback: null,
        });

        if (pointCount === 0) {
          continue;
        }

        updatedCars += 1;
        insertedPoints += pointCount;
        console.log(
          `  ${car.licensePlate}${car.name ? ` (${car.name})` : ''} → ${pointCount} points`,
        );
      }
    });

    console.log(
      `Replaced trajectories for ${updatedCars} cars (${insertedPoints} samples).`,
    );
  } finally {
    await redis.quit();
    await pool.end();
  }
}

seedCarTrajectories().catch(function onSeedError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to seed car trajectories: ${message}`);
  process.exit(1);
});
