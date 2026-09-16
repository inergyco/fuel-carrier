import { ilike, isNotNull, isNull, or } from 'drizzle-orm';
import { toIlikeContainsPattern } from '../common/sql/ilike-pattern.utils';
import { cars } from '../database/schema/cars';

export function buildCarSearchFilter(searchText: string | undefined) {
  if (!searchText) {
    return undefined;
  }

  const pattern = toIlikeContainsPattern(searchText);
  return or(ilike(cars.licensePlate, pattern), ilike(cars.name, pattern));
}

export function buildCarAssignmentFilter(
  assignment: 'all' | 'assigned' | 'unassigned' | undefined,
) {
  if (assignment === 'assigned') {
    return isNotNull(cars.driverId);
  }

  if (assignment === 'unassigned') {
    return isNull(cars.driverId);
  }

  return undefined;
}
