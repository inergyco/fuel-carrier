import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  type ResourceListParams,
} from '@fuel-carrier/shared-types'
import {
  parsePaginationSearch,
  type PaginationSearch,
} from './usePagination'

const SEARCH_DEBOUNCE_MS = 300

/** Optional list filters on top of `?page=&limit=`. */
export type ResourceListSearch = PaginationSearch & {
  search?: string
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

  return result
}

function toUrlSearch(params: ResourceListParams): ResourceListSearch {
  return {
    page: params.page > 1 ? params.page : undefined,
    limit: params.limit !== DEFAULT_LIMIT ? params.limit : undefined,
    search: params.search,
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
 * Syncs list pagination + search with the current route URL.
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
              search: nextSearch,
            }),
          ),
        replace: true,
      })
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [draftSearchText, listParams.search, listParams.limit, navigate])

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
    handlePageChange,
    handleLimitChange,
    hasActiveFilters: Boolean(listParams.search),
  }
}
