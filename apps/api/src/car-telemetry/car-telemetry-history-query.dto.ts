import { z } from 'zod';

export const carTelemetryHistoryQuerySchema = z
  .object({
    carId: z.uuid(),
    start: z.iso.datetime({ offset: true }),
    end: z.iso.datetime({ offset: true }),
  })
  .refine(
    function hasAscendingTimeRange(value) {
      return new Date(value.start).getTime() <= new Date(value.end).getTime();
    },
    {
      message: 'Start datetime must be before end datetime',
      path: ['end'],
    },
  );

export type CarTelemetryHistoryQueryDto = z.infer<
  typeof carTelemetryHistoryQuerySchema
>;
