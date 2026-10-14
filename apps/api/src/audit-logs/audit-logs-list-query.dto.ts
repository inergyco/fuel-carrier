import { z } from 'zod';
import { paginationQuerySchema } from '../common/dto/pagination-query.dto';

export const auditLogsListQuerySchema = paginationQuerySchema
  .extend({
    search: z.string().max(64).optional(),
    start: z.iso.datetime({ offset: true }).optional(),
    end: z.iso.datetime({ offset: true }).optional(),
  })
  .refine(
    function hasAscendingTimeRange(value) {
      if (value.start == null || value.end == null) {
        return true;
      }

      return new Date(value.start).getTime() <= new Date(value.end).getTime();
    },
    {
      message: 'Start datetime must be before end datetime',
      path: ['end'],
    },
  )
  .transform(function normalizeAuditLogsListQuery(query) {
    const searchText = query.search?.trim();

    return {
      page: query.page,
      limit: query.limit,
      search: searchText && searchText.length > 0 ? searchText : undefined,
      start: query.start,
      end: query.end,
    };
  });

export type AuditLogsListQueryDto = z.output<typeof auditLogsListQuerySchema>;
