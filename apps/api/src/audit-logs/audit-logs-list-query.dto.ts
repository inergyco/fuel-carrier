import { z } from 'zod';
import { paginationQuerySchema } from '../common/dto/pagination-query.dto';

export const auditLogsListQuerySchema = paginationQuerySchema
  .extend({
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
  );

export type AuditLogsListQueryDto = z.infer<typeof auditLogsListQuerySchema>;
