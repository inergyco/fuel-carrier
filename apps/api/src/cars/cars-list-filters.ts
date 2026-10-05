import { and, eq, exists, ilike, or } from 'drizzle-orm';
import { QueryBuilder } from 'drizzle-orm/pg-core';
import { toIlikeContainsPattern } from '../common/sql/ilike-pattern.utils';
import { cars } from '../database/schema/cars';
import { drivers } from '../database/schema/drivers';

const qb = new QueryBuilder();

export function buildCarSearchFilter(searchText: string | undefined) {
  if (!searchText) {
    return undefined;
  }

  const pattern = toIlikeContainsPattern(searchText);
  return or(
    ilike(cars.licensePlate, pattern),
    ilike(cars.name, pattern),
    exists(
      qb
        .select({ id: drivers.id })
        .from(drivers)
        .where(
          and(
            eq(drivers.id, cars.driverId),
            or(
              ilike(drivers.firstName, pattern),
              ilike(drivers.lastName, pattern),
              ilike(drivers.nationalId, pattern),
            ),
          ),
        ),
    ),
  );
}

export function buildCarFuelGradeFilter(
  fuelGrade: 'all' | 'highGrade' | 'normal' | undefined,
) {
  if (fuelGrade === 'highGrade') {
    return eq(cars.hasHighGrade, true);
  }

  if (fuelGrade === 'normal') {
    return eq(cars.hasHighGrade, false);
  }

  return undefined;
}
