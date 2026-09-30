import type { PaginationParams } from './pagination';

export const FUEL_GRADE_FILTERS = ['all', 'highGrade', 'normal'] as const;

export type FuelGradeFilter = (typeof FUEL_GRADE_FILTERS)[number];

/** Text / fuel-grade filters for resource list endpoints. */
export type ResourceListFilters = {
  search?: string;
  fuelGrade?: FuelGradeFilter;
};

/** Pagination + filters for cars/drivers-style list APIs. */
export type ResourceListParams = PaginationParams & ResourceListFilters;
