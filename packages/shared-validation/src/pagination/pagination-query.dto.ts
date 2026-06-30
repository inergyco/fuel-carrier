import type { PaginationParams } from '@fuel-carrier/shared-types/pagination';
import { DEFAULT_LIMIT, MAX_LIMIT } from '@fuel-carrier/shared-types';
import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
}) satisfies z.ZodType<PaginationParams>;

export type PaginationQueryDto = PaginationParams;
