import type { ResourceListFilters } from '@fuel-carrier/shared-types'

/** Omit empty / default filters so the request URL stays clean. */
export function toResourceListFilterSearchParams(
  filters: ResourceListFilters,
): Record<string, string> {
  const searchParams: Record<string, string> = {}

  if (filters.search) {
    searchParams.search = filters.search
  }

  if (filters.assignment && filters.assignment !== 'all') {
    searchParams.assignment = filters.assignment
  }

  return searchParams
}
