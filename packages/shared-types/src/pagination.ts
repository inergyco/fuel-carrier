export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
export const LIMIT_OPTIONS = [10, 20, 50, 100] as const;
