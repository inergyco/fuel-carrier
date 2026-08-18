import { eq } from 'drizzle-orm';
import type Redis from 'ioredis';
import {
  companyCarTelemetryKey,
  serializeCarTelemetry,
} from '../car-telemetry/car-telemetry.redis';
import { carTelemetryHistory } from '../database/schema/car-telemetry-history';
import type { TenantTransaction } from '../database/tenant-db.types';
import { getCityRoute, type LatLng } from './city-routes';

const SAMPLE_INTERVAL_MS = 45_000;

type WriteCityTrajectoryInput = {
  companyId: string;
  carId: string;
  licensePlate: string;
  fallback: LatLng | null;
};

export async function writeCityTrajectory(
  tx: TenantTransaction,
  redis: Redis,
  input: WriteCityTrajectoryInput,
): Promise<number> {
  const route =
    getCityRoute(input.licensePlate) ??
    (input.fallback ? [input.fallback] : null);

  if (!route || route.length === 0) {
    return 0;
  }

  await tx
    .delete(carTelemetryHistory)
    .where(eq(carTelemetryHistory.carId, input.carId));

  const startedAt = Date.now() - (route.length - 1) * SAMPLE_INTERVAL_MS;
  const rows = route.map(function toHistoryRow(point, index) {
    const recordedAt = new Date(startedAt + index * SAMPLE_INTERVAL_MS);
    const progress = index / Math.max(1, route.length - 1);
    const remainFuel = Math.max(80, Math.round(1600 - progress * 720));
    const speed = 18 + Math.round(Math.sin(index / 4) * 12 + 18);

    return {
      time: recordedAt,
      carId: input.carId,
      companyId: input.companyId,
      latitude: point.latitude,
      longitude: point.longitude,
      speed,
      remainFuel,
      resistanceTankToGround: Number((5.1 + progress * 0.4).toFixed(2)),
      resistanceTankToNozzle: Number((4.0 + progress * 0.3).toFixed(2)),
      resistanceGroundToVehicle: Number((1.6 + progress * 0.2).toFixed(2)),
    };
  });

  await tx.insert(carTelemetryHistory).values(rows);

  const lastPoint = route[route.length - 1];
  const lastRow = rows[rows.length - 1];

  await redis.hset(
    companyCarTelemetryKey(input.companyId),
    input.carId,
    serializeCarTelemetry({
      latitude: lastPoint.latitude,
      longitude: lastPoint.longitude,
      updatedAt: lastRow.time,
      speed: lastRow.speed,
      remainFuel: lastRow.remainFuel,
      resistance: {
        tankToGround: lastRow.resistanceTankToGround,
        tankToNozzle: lastRow.resistanceTankToNozzle,
        groundToVehicle: lastRow.resistanceGroundToVehicle,
      },
    }),
  );

  return rows.length;
}
