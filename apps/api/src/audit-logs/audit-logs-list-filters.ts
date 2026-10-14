import { and, eq, exists, ilike, or } from 'drizzle-orm';
import { QueryBuilder } from 'drizzle-orm/pg-core';
import { toIlikeContainsPattern } from '../common/sql/ilike-pattern.utils';
import { auditLogs } from '../database/schema/audit-logs';
import { companyUsers } from '../database/schema/company-users';
import { users } from '../database/schema/users';

const qb = new QueryBuilder();

/**
 * Match actor by snapshotted username/display name, live user names,
 * or company-user username/national ID.
 */
export function buildAuditActorSearchFilter(searchText: string | undefined) {
  if (!searchText) {
    return undefined;
  }

  const pattern = toIlikeContainsPattern(searchText);

  return or(
    ilike(auditLogs.actorUsername, pattern),
    ilike(auditLogs.actorDisplayName, pattern),
    exists(
      qb
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.id, auditLogs.actorUserId),
            or(ilike(users.firstName, pattern), ilike(users.lastName, pattern)),
          ),
        ),
    ),
    exists(
      qb
        .select({ id: companyUsers.id })
        .from(companyUsers)
        .where(
          and(
            eq(companyUsers.userId, auditLogs.actorUserId),
            or(
              ilike(companyUsers.username, pattern),
              ilike(companyUsers.nationalId, pattern),
            ),
          ),
        ),
    ),
  );
}
