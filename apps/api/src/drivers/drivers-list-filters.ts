import { ilike, or } from 'drizzle-orm';
import { toIlikeContainsPattern } from '../common/sql/ilike-pattern.utils';
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
    ilike(drivers.mobileNumber, pattern),
  );
}
