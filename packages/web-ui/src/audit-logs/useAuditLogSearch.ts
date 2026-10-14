import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  type AuditLogListParams,
} from '@fuel-carrier/shared-types'
import type { DateTimeRangeValue } from '../ui/LocalizedDateTimeRangePicker'
import { useDebouncedValue } from '../ui/useDebouncedValue'
import {
  parsePaginationSearch,
  type PaginationSearch,
} from '../ui/usePagination'
import { normalizeResourceListSearchText } from '../ui/useResourceListSearch'

/** Optional `?page=&limit=&search=&start=&end=` on audit log list routes. */
export type AuditLogSearch = PaginationSearch & {
  search?: string
  start?: string
  end?: string
}

/**
 * Normalize raw route search into pagination + optional ISO date range.
 * Use as `validateSearch` on audit log list routes.
 */
export function parseAuditLogSearch(
  search: Record<string, unknown>,
): AuditLogSearch {
  const result: AuditLogSearch = { ...parsePaginationSearch(search) }

  if (typeof search.search === 'string') {
    const searchText = normalizeResourceListSearchText(search.search)
    if (searchText) {
      result.search = searchText
    }
  }

  const start = parseIsoSearchParam(search.start)
  const end = parseIsoSearchParam(search.end)

  if (start) {
    result.start = start
  }

  if (end) {
    result.end = end
  }

  if (result.start && result.end) {
    const startMs = new Date(result.start).getTime()
    const endMs = new Date(result.end).getTime()
    if (startMs > endMs) {
      delete result.start
      delete result.end
    }
  }

  return result
}

function parseIsoSearchParam(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }

  return parsed.toISOString()
}

function toUrlSearch(params: AuditLogListParams): AuditLogSearch {
  return {
    page: params.page > 1 ? params.page : undefined,
    limit: params.limit !== DEFAULT_LIMIT ? params.limit : undefined,
    search: params.search,
    start: params.start,
    end: params.end,
  }
}

function mergeUrlSearch(
  previous: unknown,
  next: AuditLogSearch,
): AuditLogSearch {
  return {
    ...(previous !== null && typeof previous === 'object'
      ? (previous as AuditLogSearch)
      : {}),
    ...next,
  }
}

function toDraftRange(params: AuditLogListParams): DateTimeRangeValue {
  return {
    start: params.start ? new Date(params.start) : null,
    end: params.end ? new Date(params.end) : null,
  }
}

/**
 * Syncs audit log pagination, actor search, and date range with the route URL.
 * Search text is debounced. The date range updates the URL only when both
 * ends are set, or when cleared.
 */
export function useAuditLogSearch() {
  const routeSearch = useSearch({ strict: false })
  const navigate = useNavigate()
  const parsed = parseAuditLogSearch(routeSearch)
  const listParams: AuditLogListParams = {
    page: parsed.page ?? 1,
    limit: parsed.limit ?? DEFAULT_LIMIT,
    search: parsed.search,
    start: parsed.start,
    end: parsed.end,
  }
  const urlSearchText = listParams.search ?? ''

  const [draftSearchText, setDraftSearchText] = useState(urlSearchText)
  const [draftRange, setDraftRange] = useState(() => toDraftRange(listParams))

  useEffect(() => {
    setDraftSearchText(urlSearchText)
  }, [urlSearchText])

  useEffect(() => {
    setDraftRange({
      start: listParams.start ? new Date(listParams.start) : null,
      end: listParams.end ? new Date(listParams.end) : null,
    })
  }, [listParams.start, listParams.end])

  function patchListParams(patch: Partial<AuditLogListParams>) {
    void navigate({
      to: '.',
      search: (previous: unknown) =>
        mergeUrlSearch(previous, toUrlSearch({ ...listParams, ...patch })),
      replace: true,
    })
  }

  const draftSearch = normalizeResourceListSearchText(draftSearchText)
  const debouncedSearch = useDebouncedValue(draftSearch)

  useEffect(() => {
    if (draftSearch === listParams.search) {
      return
    }

    if (debouncedSearch !== draftSearch) {
      return
    }

    void navigate({
      to: '.',
      search: (previous: unknown) =>
        mergeUrlSearch(
          previous,
          toUrlSearch({
            ...listParams,
            page: 1,
            search: debouncedSearch,
          }),
        ),
      replace: true,
    })
  }, [
    draftSearch,
    debouncedSearch,
    listParams.page,
    listParams.limit,
    listParams.search,
    listParams.start,
    listParams.end,
    navigate,
  ])

  function handleRangeChange(nextRange: DateTimeRangeValue) {
    setDraftRange(nextRange)

    if (nextRange.start == null && nextRange.end == null) {
      patchListParams({ page: 1, start: undefined, end: undefined })
      return
    }

    if (nextRange.start != null && nextRange.end != null) {
      patchListParams({
        page: 1,
        start: nextRange.start.toISOString(),
        end: nextRange.end.toISOString(),
      })
    }
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
    draftRange,
    handleRangeChange,
    handlePageChange,
    handleLimitChange,
    hasActiveFilters: Boolean(
      listParams.search || listParams.start || listParams.end,
    ),
  }
}
