import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  type PaginationParams,
} from '@fuel-carrier/shared-types'

/** Optional `?page=&limit=` on list routes (defaults omitted from the URL). */
export type PaginationSearch = {
  page?: number
  limit?: number
}

/**
 * Normalize raw route search into optional pagination fields.
 * Use as `validateSearch` on paginated list routes.
 */
export function parsePaginationSearch(
  search: Record<string, unknown>,
): PaginationSearch {
  const page = Number(search.page)
  const limit = Number(search.limit)
  const result: PaginationSearch = {}

  if (Number.isInteger(page) && page >= 1) {
    result.page = page
  }

  if (Number.isInteger(limit) && limit >= 1 && limit <= MAX_LIMIT) {
    result.limit = limit
  }

  return result
}

function getPaginationFromSearch(search: PaginationSearch): PaginationParams {
  return {
    page: search.page ?? 1,
    limit: search.limit ?? DEFAULT_LIMIT,
  }
}

function mergePaginationSearch(
  previous: unknown,
  next: PaginationSearch,
): PaginationSearch {
  const base =
    previous !== null && typeof previous === 'object'
      ? (previous as PaginationSearch)
      : {}

  return {
    ...base,
    ...next,
  }
}

/**
 * Syncs list pagination with `?page=&limit=` on the current route.
 * Changing limit resets to page 1. Defaults are omitted from the URL.
 */
export function usePagination(): {
  pagination: PaginationParams
  handlePageChange: (page: number) => void
  handleLimitChange: (limit: number) => void
} {
  const search = useSearch({ strict: false })
  const navigate = useNavigate()
  const pagination = getPaginationFromSearch(parsePaginationSearch(search))

  function handlePageChange(nextPage: number) {
    void navigate({
      to: '.',
      search: (previous: unknown) =>
        mergePaginationSearch(previous, {
          page: nextPage > 1 ? nextPage : undefined,
          limit:
            pagination.limit !== DEFAULT_LIMIT ? pagination.limit : undefined,
        }),
      replace: true,
    })
  }

  function handleLimitChange(nextLimit: number) {
    void navigate({
      to: '.',
      search: (previous: unknown) =>
        mergePaginationSearch(previous, {
          page: undefined,
          limit: nextLimit !== DEFAULT_LIMIT ? nextLimit : undefined,
        }),
      replace: true,
    })
  }

  return {
    pagination,
    handlePageChange,
    handleLimitChange,
  }
}
