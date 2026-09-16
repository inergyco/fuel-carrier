import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ASSIGNMENT_FILTERS,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  type AssignmentFilter,
  type ResourceListParams,
} from '@fuel-carrier/shared-types'
import {
  parsePaginationSearch,
  type PaginationSearch,
} from './usePagination'

const SEARCH_DEBOUNCE_MS = 300
const ASSIGNMENT_VALUES = new Set<string>(ASSIGNMENT_FILTERS)

/** Optional list filters on top of `?page=&limit=`. */
export type ResourceListSearch = PaginationSearch & {
  search?: string
  assignment?: AssignmentFilter
}

/**
 * Normalize raw route search into pagination + list filter fields.
 * Use as `validateSearch` on cars/drivers list routes.
 */
export function parseResourceListSearch(
  search: Record<string, unknown>,
): ResourceListSearch {
  const result: ResourceListSearch = { ...parsePaginationSearch(search) }

  if (typeof search.search === 'string') {
    const searchText = search.search.trim().slice(0, 64)
    if (searchText.length > 0) {
      result.search = searchText
    }
  }

  if (
    typeof search.assignment === 'string' &&
    ASSIGNMENT_VALUES.has(search.assignment) &&
    search.assignment !== 'all'
  ) {
    result.assignment = search.assignment as AssignmentFilter
  }

  return result
}

function toUrlSearch(params: ResourceListParams): ResourceListSearch {
  return {
    page: params.page > 1 ? params.page : undefined,
    limit: params.limit !== DEFAULT_LIMIT ? params.limit : undefined,
    search: params.search,
    assignment:
      params.assignment && params.assignment !== 'all'
        ? params.assignment
        : undefined,
  }
}

function mergeUrlSearch(
  previous: unknown,
  next: ResourceListSearch,
): ResourceListSearch {
  return {
    ...(previous !== null && typeof previous === 'object'
      ? (previous as ResourceListSearch)
      : {}),
    ...next,
  }
}

/**
 * Syncs list pagination + search/assignment filters with the current route URL.
 * Draft search text is debounced before writing `search` to the URL.
 */
export function useResourceListSearch() {
  const routeSearch = useSearch({ strict: false })
  const navigate = useNavigate()
  const parsed = parseResourceListSearch(routeSearch)
  const listParams: ResourceListParams = {
    page: parsed.page ?? 1,
    limit: parsed.limit ?? DEFAULT_LIMIT,
    search: parsed.search,
    assignment: parsed.assignment ?? 'all',
  }
  const urlSearchText = listParams.search ?? ''

  const [draftSearchText, setDraftSearchText] = useState(urlSearchText)
  const [syncedUrlSearchText, setSyncedUrlSearchText] = useState(urlSearchText)

  if (urlSearchText !== syncedUrlSearchText) {
    setSyncedUrlSearchText(urlSearchText)
    setDraftSearchText(urlSearchText)
  }

  function patchListParams(patch: Partial<ResourceListParams>) {
    void navigate({
      to: '.',
      search: (previous: unknown) =>
        mergeUrlSearch(previous, toUrlSearch({ ...listParams, ...patch })),
      replace: true,
    })
  }

  useEffect(() => {
    const trimmed = draftSearchText.trim().slice(0, 64)
    const nextSearch = trimmed.length > 0 ? trimmed : undefined

    if (nextSearch === listParams.search) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void navigate({
        to: '.',
        search: (previous: unknown) =>
          mergeUrlSearch(
            previous,
            toUrlSearch({
              page: 1,
              limit: listParams.limit,
              assignment: listParams.assignment,
              search: nextSearch,
            }),
          ),
        replace: true,
      })
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [
    draftSearchText,
    listParams.search,
    listParams.limit,
    listParams.assignment,
    navigate,
  ])

  function setAssignment(assignment: AssignmentFilter) {
    patchListParams({ page: 1, assignment })
  }

  function handlePageChange(page: number) {
    patchListParams({ page })
  }

  function handleLimitChange(limit: number) {
    patchListParams({
      page: 1,
      limit:
        Number.isInteger(limit) && limit >= 1 && limit <= MAX_LIMIT
          ? limit
          : DEFAULT_LIMIT,
    })
  }

  return {
    listParams,
    draftSearchText,
    setDraftSearchText,
    setAssignment,
    handlePageChange,
    handleLimitChange,
    hasActiveFilters:
      Boolean(listParams.search) || listParams.assignment !== 'all',
  }
}
