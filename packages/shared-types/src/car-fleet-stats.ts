/** Create-time default. Every tank on a car shares this capacity. */
export const DEFAULT_TANK_CAPACITY_LITERS = 415;

export const MIN_TANK_CAPACITY_LITERS = 1;

export const MAX_TANK_CAPACITY_LITERS = 10_000;

/** Create-time default. A car may have 1, 2, or 3 tanks. */
export const DEFAULT_TANK_COUNT = 3;

export const MIN_TANK_COUNT = 1;

export const MAX_TANK_COUNT = 3;

/** Total usable capacity when a car still uses the create-time defaults. */
export const FLEET_TOTAL_CAPACITY_LITERS =
  DEFAULT_TANK_CAPACITY_LITERS * DEFAULT_TANK_COUNT;

/** Liters across every compartment. Tanks on one car share one capacity. */
export function getTotalTankCapacityLiters(
  tankCount: number = DEFAULT_TANK_COUNT,
  tankCapacityLiters: number = DEFAULT_TANK_CAPACITY_LITERS,
): number {
  const count = Number.isFinite(tankCount)
    ? Math.trunc(tankCount)
    : DEFAULT_TANK_COUNT;
  const capacity = Number.isFinite(tankCapacityLiters)
    ? tankCapacityLiters
    : DEFAULT_TANK_CAPACITY_LITERS;

  return Math.max(0, count) * Math.max(0, capacity);
}

export const FUEL_LEVELS = [
  'high',
  'midHigh',
  'midLow',
  'low',
  'unknown',
] as const;

export type FuelLevel = (typeof FUEL_LEVELS)[number];

/** Aggregated fleet counts for dashboard KPI widgets. */
export type CarFleetStats = {
  totalCars: number;
  fuelHigh: number;
  fuelMidHigh: number;
  fuelMidLow: number;
  fuelLow: number;
  highGrade: number;
};

/**
 * Bands: ≥75% green, ≥50% blue, ≥25% orange, &lt;25% red.
 * Missing / non-finite remainFuel → unknown.
 */
export function getFuelLevel(
  remainFuel: number | null | undefined,
  totalCapacityLiters: number = FLEET_TOTAL_CAPACITY_LITERS,
): FuelLevel {
  if (remainFuel == null || !Number.isFinite(remainFuel)) {
    return 'unknown';
  }

  const capacity =
    Number.isFinite(totalCapacityLiters) && totalCapacityLiters > 0
      ? totalCapacityLiters
      : FLEET_TOTAL_CAPACITY_LITERS;
  const percent = Math.max(0, Math.min(100, (remainFuel / capacity) * 100));

  if (percent >= 75) {
    return 'high';
  }

  if (percent >= 50) {
    return 'midHigh';
  }

  if (percent >= 25) {
    return 'midLow';
  }

  return 'low';
}

export function computeCarFleetStats(
  cars: readonly {
    id: string;
    hasHighGrade: boolean;
    tankCount: number;
    tankCapacityLiters: number;
  }[],
  remainFuelByCarId: ReadonlyMap<string, number | undefined>,
): CarFleetStats {
  let fuelHigh = 0;
  let fuelMidHigh = 0;
  let fuelMidLow = 0;
  let fuelLow = 0;
  let highGrade = 0;

  for (const car of cars) {
    if (car.hasHighGrade) {
      highGrade += 1;
    }

    const level = getFuelLevel(
      remainFuelByCarId.get(car.id),
      getTotalTankCapacityLiters(car.tankCount, car.tankCapacityLiters),
    );

    if (level === 'high') {
      fuelHigh += 1;
    } else if (level === 'midHigh') {
      fuelMidHigh += 1;
    } else if (level === 'midLow') {
      fuelMidLow += 1;
    } else if (level === 'low') {
      fuelLow += 1;
    }
  }

  return {
    totalCars: cars.length,
    fuelHigh,
    fuelMidHigh,
    fuelMidLow,
    fuelLow,
    highGrade,
  };
}
