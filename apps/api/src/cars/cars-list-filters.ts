import { eq, ilike, or } from 'drizzle-orm';
import { toIlikeContainsPattern } from '../common/sql/ilike-pattern.utils';
import { cars } from '../database/schema/cars';

export function buildCarSearchFilter(searchText: string | undefined) {
  if (!searchText) {
    return undefined;
  }

  const pattern = toIlikeContainsPattern(searchText);
  return or(ilike(cars.licensePlate, pattern), ilike(cars.name, pattern));
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
