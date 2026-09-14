import type { PaginatedResult, PaginationParams } from '@fuel-carrier/shared-types'
import { MAX_LIMIT } from '@fuel-carrier/shared-types'

/**
 * Walk every page of a paginated list endpoint (for dashboards/maps that need
 * the full set). Caps each request at MAX_LIMIT.
 */
export async function fetchAllPaginated<T>(
  fetchPage: (params: PaginationParams) => Promise<PaginatedResult<T>>,
): Promise<T[]> {
  const limit = MAX_LIMIT
  const first = await fetchPage({ page: 1, limit })
  const items = [...first.items]

  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await fetchPage({ page, limit })
    items.push(...next.items)
  }

  return items
}
