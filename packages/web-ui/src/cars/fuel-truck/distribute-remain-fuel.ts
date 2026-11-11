import {
  DEFAULT_TANK_CAPACITY_LITERS,
  DEFAULT_TANK_COUNT,
} from '@fuel-carrier/shared-types';

export { DEFAULT_TANK_CAPACITY_LITERS, DEFAULT_TANK_COUNT };

/**
 * Splits remaining fuel evenly so every tank drops together.
 * Each tank is capped at its own capacity.
 */
export function distributeRemainFuel(
  remainFuel: number,
  tankCount: number = DEFAULT_TANK_COUNT,
  capacityPerTank: number = DEFAULT_TANK_CAPACITY_LITERS,
): number[] {
  const count = Math.max(0, Math.trunc(tankCount));
  const share =
    count === 0
      ? 0
      : Math.min(
          Math.max(0, capacityPerTank),
          Math.max(0, remainFuel) / count,
        );

  return Array.from({ length: count }, () => share);
}
