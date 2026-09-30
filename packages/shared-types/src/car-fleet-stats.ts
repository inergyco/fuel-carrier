/** Default compartment capacity used until cars expose tank capacity from the API. */
export const DEFAULT_TANK_CAPACITY_LITERS = 500;

export const DEFAULT_TANK_COUNT = 3;

/** Total usable capacity across all tank compartments. */
export const FLEET_TOTAL_CAPACITY_LITERS =
  DEFAULT_TANK_CAPACITY_LITERS * DEFAULT_TANK_COUNT;

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
export function getFuelLevel(remainFuel: number | null | undefined): FuelLevel {
  if (remainFuel == null || !Number.isFinite(remainFuel)) {
    return 'unknown';
  }

  const percent = Math.max(
    0,
    Math.min(100, (remainFuel / FLEET_TOTAL_CAPACITY_LITERS) * 100),
  );

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
  cars: readonly { id: string; hasHighGrade: boolean }[],
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

    const level = getFuelLevel(remainFuelByCarId.get(car.id));

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
