import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '@fuel-carrier/shared-types/pagination';
import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;
