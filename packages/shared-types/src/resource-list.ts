import type { PaginationParams } from './pagination';

export const ASSIGNMENT_FILTERS = [
  'all',
  'assigned',
  'unassigned',
] as const;

export type AssignmentFilter = (typeof ASSIGNMENT_FILTERS)[number];

/** Text / assignment filters for resource list endpoints. */
export type ResourceListFilters = {
  search?: string;
  assignment?: AssignmentFilter;
};

/** Pagination + filters for cars/drivers-style list APIs. */
export type ResourceListParams = PaginationParams & ResourceListFilters;
