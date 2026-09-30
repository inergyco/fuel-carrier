import { and, inArray } from 'drizzle-orm';
import type { FuelLevelFilter } from '@fuel-carrier/shared-types';
import { getFuelLevel } from '@fuel-carrier/shared-types/car-fleet-stats';
import { cars } from '../database/schema/cars';
import type { TenantTransaction } from '../database/tenant-db.types';

type CarListWhere = ReturnType<typeof and>;

/**
 * Narrows the car list to a live remain-fuel band (Redis).
 * Returns `null` when the band matches no cars.
 * Company-scoped only; without a company id the filter is skipped.
 */
export async function applyCarFuelLevelFilter(options: {
  tx: TenantTransaction;
  baseWhere: CarListWhere;
  companyId: string | null;
  fuelLevel: FuelLevelFilter;
  getRemainFuelByCarId: (
    companyId: string,
  ) => Promise<Map<string, number | undefined>>;
}): Promise<CarListWhere | null> {
  const { tx, baseWhere, companyId, fuelLevel, getRemainFuelByCarId } =
    options;

  if (fuelLevel === 'all' || !companyId) {
    return baseWhere;
  }

  const scopeRows = await tx
    .select({ id: cars.id })
    .from(cars)
    .where(baseWhere);

  if (scopeRows.length === 0) {
    return null;
  }

  const remainFuelByCarId = await getRemainFuelByCarId(companyId);
  const matchingIds = scopeRows
    .filter(function matchesFuelLevel(row) {
      return getFuelLevel(remainFuelByCarId.get(row.id)) === fuelLevel;
    })
    .map(function toCarId(row) {
      return row.id;
    });

  if (matchingIds.length === 0) {
    return null;
  }

  return and(baseWhere, inArray(cars.id, matchingIds));
}
