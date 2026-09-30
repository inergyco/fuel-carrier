import {
  DEFAULT_TANK_CAPACITY_LITERS,
  DEFAULT_TANK_COUNT,
} from '@fuel-carrier/shared-types';

export { DEFAULT_TANK_CAPACITY_LITERS, DEFAULT_TANK_COUNT };

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
