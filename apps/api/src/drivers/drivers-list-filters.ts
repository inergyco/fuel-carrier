import { ilike, isNotNull, isNull, or } from 'drizzle-orm';
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

/** Requires a left join of `cars` onto the driver (see DriversService.list). */
export function buildDriverAssignmentFilter(
  assignment: 'all' | 'assigned' | 'unassigned' | undefined,
) {
  if (assignment === 'assigned') {
    return isNotNull(cars.id);
  }

  if (assignment === 'unassigned') {
    return isNull(cars.id);
  }

  return undefined;
}
