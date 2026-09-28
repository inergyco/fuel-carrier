import { and, eq, exists, ilike, isNull, notExists, or } from 'drizzle-orm';
import { QueryBuilder } from 'drizzle-orm/pg-core';
import { toIlikeContainsPattern } from '../common/sql/ilike-pattern.utils';
import { cars } from '../database/schema/cars';
import { drivers } from '../database/schema/drivers';

export function buildDriverSearchFilter(searchText: string | undefined) {
  if (!searchText) {
    return undefined;
  }

  const pattern = toIlikeContainsPattern(searchText);
  return or(
    ilike(drivers.firstName, pattern),
    ilike(drivers.lastName, pattern),
    ilike(drivers.nationalId, pattern),
  );
}

/** Filters by whether a live car currently points at the driver. */
export function buildDriverAssignmentFilter(
  assignment: 'all' | 'assigned' | 'unassigned' | undefined,
) {
  if (assignment === 'assigned') {
    return exists(liveCarAssignedToDriver());
  }

  if (assignment === 'unassigned') {
    return notExists(liveCarAssignedToDriver());
  }

  return undefined;
}

function liveCarAssignedToDriver() {
  const qb = new QueryBuilder();

  return qb
    .select({ id: cars.id })
    .from(cars)
    .where(and(eq(cars.driverId, drivers.id), isNull(cars.deletedAt)));
}
