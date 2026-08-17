/** Default compartment capacity used until cars expose tank capacity from the API. */
export const DEFAULT_TANK_CAPACITY_LITERS = 500;
export const DEFAULT_TANK_COUNT = 3;

/**
 * Fills tanks from front to back with the remaining fuel volume from telemetry.
 */
export function distributeRemainFuel(
  remainFuel: number,
  tankCount: number = DEFAULT_TANK_COUNT,
  capacityPerTank: number = DEFAULT_TANK_CAPACITY_LITERS,
): number[] {
  let remaining = Math.max(0, remainFuel);
  const filled: number[] = [];

  for (let index = 0; index < tankCount; index += 1) {
    const amount = Math.min(capacityPerTank, remaining);
    filled.push(amount);
    remaining -= amount;
  }

  return filled;
}
