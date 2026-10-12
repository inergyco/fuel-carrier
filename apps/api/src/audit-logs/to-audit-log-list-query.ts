import type { AuditLogListQuery } from './audit-log.service';
import type { AuditLogsListQueryDto } from './audit-logs-list-query.dto';

export const toAuditLogListQuery = (
  query: AuditLogsListQueryDto,
): AuditLogListQuery => ({
  page: query.page,
  limit: query.limit,
  start: query.start ? new Date(query.start) : undefined,
  end: query.end ? new Date(query.end) : undefined,
});
