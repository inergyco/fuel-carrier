import type { PaginationParams } from './pagination';

export const FUEL_GRADE_FILTERS = ['all', 'highGrade', 'normal'] as const;

export type FuelGradeFilter = (typeof FUEL_GRADE_FILTERS)[number];

/** Live remain-fuel bands (matches fleet stats); `all` means no filter. */
export const FUEL_LEVEL_FILTERS = [
  'all',
  'high',
  'midHigh',
  'midLow',
  'low',
] as const;

export type FuelLevelFilter = (typeof FUEL_LEVEL_FILTERS)[number];

/** Text / fuel-grade / fuel-level filters for resource list endpoints. */
export type ResourceListFilters = {
  search?: string;
  fuelGrade?: FuelGradeFilter;
  fuelLevel?: FuelLevelFilter;
};

/** Pagination + filters for cars/drivers-style list APIs. */
export type ResourceListParams = PaginationParams & ResourceListFilters;
