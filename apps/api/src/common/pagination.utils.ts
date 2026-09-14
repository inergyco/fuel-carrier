import type {
  PaginatedResult,
  PaginationParams,
} from '@fuel-carrier/shared-types';

type ToPaginatedResultInput<T> = PaginationParams & {
  items: T[];
  totalItems: number;
};

/** Build a standard paginated API envelope from a page of rows. */
export function toPaginatedResult<T>(
  input: ToPaginatedResultInput<T>,
): PaginatedResult<T> {
  const { items, page, limit, totalItems } = input;

  return {
    items,
    page,
    limit,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}

/** SQL/Drizzle offset for 1-based page indexes. */
export function getPaginationOffset(input: PaginationParams): number {
  return (input.page - 1) * input.limit;
}
