import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  type AuditLogListParams,
} from '@fuel-carrier/shared-types'
import {
  parsePaginationSearch,
  type PaginationSearch,
} from '../ui/usePagination'
import type { DateTimeRangeValue } from '../ui/LocalizedDateTimeRangePicker'

/** Optional `?page=&limit=&start=&end=` on audit log list routes. */
export type AuditLogSearch = PaginationSearch & {
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

function rangesEqual(a: DateTimeRangeValue, b: DateTimeRangeValue): boolean {
  return (
    (a.start?.getTime() ?? null) === (b.start?.getTime() ?? null) &&
    (a.end?.getTime() ?? null) === (b.end?.getTime() ?? null)
  )
}

/**
 * Syncs audit log pagination + date range with the current route URL.
 * Draft range updates the URL only when both ends are set, or when cleared.
 */
export function useAuditLogSearch() {
  const routeSearch = useSearch({ strict: false })
  const navigate = useNavigate()
  const parsed = parseAuditLogSearch(routeSearch)
  const listParams: AuditLogListParams = {
    page: parsed.page ?? 1,
    limit: parsed.limit ?? DEFAULT_LIMIT,
    start: parsed.start,
    end: parsed.end,
  }
  const urlRange = toDraftRange(listParams)

  const [draftRange, setDraftRange] = useState(urlRange)
  const [syncedUrlRange, setSyncedUrlRange] = useState(urlRange)

  if (!rangesEqual(urlRange, syncedUrlRange)) {
    setSyncedUrlRange(urlRange)
    setDraftRange(urlRange)
  }

  function patchListParams(patch: Partial<AuditLogListParams>) {
    void navigate({
      to: '.',
      search: (previous: unknown) =>
        mergeUrlSearch(previous, toUrlSearch({ ...listParams, ...patch })),
      replace: true,
    })
  }

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
    draftRange,
    handleRangeChange,
    handlePageChange,
    handleLimitChange,
    hasActiveFilters: Boolean(listParams.start || listParams.end),
  }
}
