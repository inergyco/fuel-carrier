import 'dotenv/config';
import {
  CarLocationSocketEvents,
  type CarLocationRealtimeEvent,
} from '@fuel-carrier/shared-types';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import Redis from 'ioredis';
import { Pool } from 'pg';
import {
  companyCarLocationsKey,
  serializeCarLocation,
} from '../car-locations/car-location.redis';
import { CAR_LOCATION_UPDATES_CHANNEL } from '../car-locations/car-locations-realtime.service';
import { cars } from '../database/schema/cars';
import { carLocationHistory } from '../database/schema/car-location-history';
import * as schema from '../database/schema';

/** Default: first Pars (Tehran) seed car. */
const DEFAULT_PLATE = '۱۲ب۳۴۵-۶۷';

/** Short Valiasr-area path through northern Tehran (lat, lng). */
const TEHRAN_WAYPOINTS: Array<[number, number]> = [
  [35.7575, 51.4097],
  [35.748, 51.4105],
  [35.735, 51.411],
  [35.7219, 51.405],
  [35.715, 51.39],
  [35.71, 51.38],
  [35.7219, 51.3347],
];

type SimulateOptions = {
  plate: string;
  intervalMs: number;
  stepsPerSegment: number;
  loops: number;
};

type TargetCar = {
  id: string;
  companyId: string;
  name: string | null;
  licensePlate: string;
};

async function simulateCarPath(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const databaseUrl = process.env.DATABASE_URL;
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });
  const redis = new Redis(redisUrl, { maxRetriesPerRequest: 3 });

  try {
    const car = await resolveCar(db, options.plate);
    const path = buildInterpolatedPath(
      TEHRAN_WAYPOINTS,
      options.stepsPerSegment,
    );

    console.log(
      `Moving ${car.licensePlate}${car.name ? ` (${car.name})` : ''} along ${path.length} points × ${options.loops} loop(s), every ${options.intervalMs}ms`,
    );

    for (let loop = 0; loop < options.loops; loop += 1) {
      if (options.loops > 1) {
        console.log(`Loop ${loop + 1}/${options.loops}`);
      }

      for (let index = 0; index < path.length; index += 1) {
        const [latitude, longitude] = path[index];
        await recordStep(db, redis, car, latitude, longitude);
        console.log(
          `  [${index + 1}/${path.length}] ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        );

        if (index < path.length - 1 || loop < options.loops - 1) {
          await sleep(options.intervalMs);
        }
      }
    }

    console.log('Done.');
  } finally {
    await redis.quit();
    await pool.end();
  }
}

async function resolveCar(
  db: ReturnType<typeof drizzle<typeof schema>>,
  plate: string,
): Promise<TargetCar> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.is_internal', 'true', true)`);

    const [car] = await tx
      .select({
        id: cars.id,
        companyId: cars.companyId,
        name: cars.name,
        licensePlate: cars.licensePlate,
      })
      .from(cars)
      .where(eq(cars.licensePlate, plate))
      .limit(1);

    if (!car) {
      throw new Error(`No car found with license plate "${plate}"`);
    }

    return car;
  });
}

async function recordStep(
  db: ReturnType<typeof drizzle<typeof schema>>,
  redis: Redis,
  car: TargetCar,
  latitude: number,
  longitude: number,
): Promise<void> {
  const recordedAt = new Date();

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.is_internal', 'true', true)`);
    await tx.insert(carLocationHistory).values({
      time: recordedAt,
      carId: car.id,
      companyId: car.companyId,
      latitude,
      longitude,
    });
  });

  await redis.hset(
    companyCarLocationsKey(car.companyId),
    car.id,
    serializeCarLocation({
      latitude,
      longitude,
      updatedAt: recordedAt,
    }),
  );

  const event: CarLocationRealtimeEvent = {
    type: CarLocationSocketEvents.LOCATION_UPDATED,
    companyId: car.companyId,
    marker: {
      carId: car.id,
      latitude,
      longitude,
      updatedAt: recordedAt.toISOString(),
      name: car.name,
      licensePlate: car.licensePlate,
    },
  };

  await redis.publish(CAR_LOCATION_UPDATES_CHANNEL, JSON.stringify(event));
}

function buildInterpolatedPath(
  waypoints: Array<[number, number]>,
  stepsPerSegment: number,
): Array<[number, number]> {
  if (waypoints.length === 0) {
    return [];
  }

  const path: Array<[number, number]> = [];

  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const [lat0, lng0] = waypoints[i];
    const [lat1, lng1] = waypoints[i + 1];

    for (let step = 0; step < stepsPerSegment; step += 1) {
      const t = step / stepsPerSegment;
      path.push([lat0 + (lat1 - lat0) * t, lng0 + (lng1 - lng0) * t]);
    }
  }

  path.push(waypoints[waypoints.length - 1]);
  return path;
}

function parseCliOptions(argv: string[]): SimulateOptions {
  const options: SimulateOptions = {
    plate: DEFAULT_PLATE,
    intervalMs: 1000,
    stepsPerSegment: 8,
    loops: 1,
  };

  for (const arg of argv) {
    if (arg === '--') {
      continue;
    }

    if (arg.startsWith('--plate=')) {
      options.plate = arg.slice('--plate='.length);
      continue;
    }

    if (arg.startsWith('--interval-ms=')) {
      options.intervalMs = parsePositiveInt(
        arg.slice('--interval-ms='.length),
        'interval-ms',
      );
      continue;
    }

    if (arg.startsWith('--steps-per-segment=')) {
      options.stepsPerSegment = parsePositiveInt(
        arg.slice('--steps-per-segment='.length),
        'steps-per-segment',
      );
      continue;
    }

    if (arg.startsWith('--loops=')) {
      options.loops = parsePositiveInt(arg.slice('--loops='.length), 'loops');
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}\n${usageText()}`);
  }

  return options;
}

function parsePositiveInt(raw: string, name: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`--${name} must be a positive integer (got "${raw}")`);
  }
  return value;
}

function sleep(ms: number): Promise<void> {
  return new Promise(function resolveSleep(resolve) {
    setTimeout(resolve, ms);
  });
}

function usageText(): string {
  return [
    'Usage: pnpm simulate:car-path [--plate=…] [--interval-ms=1000] [--steps-per-segment=8] [--loops=1]',
    `Default plate: ${DEFAULT_PLATE}`,
  ].join('\n');
}

function printUsage(): void {
  console.log(usageText());
}

simulateCarPath().catch(function onSimulateError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to simulate car path: ${message}`);
  process.exit(1);
});
