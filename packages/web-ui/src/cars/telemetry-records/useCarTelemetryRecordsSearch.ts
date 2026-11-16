import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { DEFAULT_LIMIT, MAX_LIMIT } from '@fuel-carrier/shared-types'
import type { DateTimeRangeValue } from '../../ui/LocalizedDateTimeRangePicker'
import {
  parsePaginationSearch,
  type PaginationSearch,
} from '../../ui/usePagination'

/** Optional `?page=&limit=&start=&end=` on a car telemetry records route. */
export type CarTelemetryRecordsSearch = PaginationSearch & {
  start?: string
  end?: string
}

/**
 * Syncs telemetry record pagination and an optional sample time range with the route URL.
 * A visit with no range shows every stored sample. The range is applied only when both ends are set.
 */
export function useCarTelemetryRecordsSearch() {
  const routeSearch = useSearch({ strict: false })
  const navigate = useNavigate()
  const parsed = parseCarTelemetryRecordsSearch(routeSearch)
  const page = parsed.page ?? 1
  const limit = parsed.limit ?? DEFAULT_LIMIT
  const start = parsed.start
  const end = parsed.end
  const [draftRange, setDraftRange] = useState<DateTimeRangeValue>(() =>
    toDraftRange(start, end),
  )

  function patchSearch(next: {
    page: number
    limit: number
    start?: string
    end?: string
  }) {
    void navigate({
      to: '.',
      search: (previous: unknown) =>
        mergeUrlSearch(previous, toUrlSearch(next)),
      replace: true,
    })
  }

  useEffect(() => {
    setDraftRange(toDraftRange(start, end))
  }, [start, end])

  function handleRangeChange(nextRange: DateTimeRangeValue) {
    setDraftRange(nextRange)

    if (nextRange.start == null && nextRange.end == null) {
      patchSearch({ page: 1, limit, start: undefined, end: undefined })
      return
    }

    if (nextRange.start != null && nextRange.end != null) {
      patchSearch({
        page: 1,
        limit,
        start: nextRange.start.toISOString(),
        end: nextRange.end.toISOString(),
      })
    }
  }

  function handlePageChange(nextPage: number) {
    patchSearch({ page: nextPage, limit, start, end })
  }

  function handleLimitChange(nextLimit: number) {
    patchSearch({
      page: 1,
      limit:
        Number.isInteger(nextLimit) &&
        nextLimit >= 1 &&
        nextLimit <= MAX_LIMIT
          ? nextLimit
          : DEFAULT_LIMIT,
      start,
      end,
    })
  }

  return {
    page,
    limit,
    start,
    end,
    draftRange,
    handleRangeChange,
    handlePageChange,
    handleLimitChange,
  }
}

export function parseCarTelemetryRecordsSearch(
  search: Record<string, unknown>,
): CarTelemetryRecordsSearch {
  const result: CarTelemetryRecordsSearch = { ...parsePaginationSearch(search) }
  const start = parseIsoSearchParam(search.start)
  const end = parseIsoSearchParam(search.end)

  if (start && end && new Date(start).getTime() <= new Date(end).getTime()) {
    result.start = start
    result.end = end
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

const toDraftRange = (start?: string, end?: string): DateTimeRangeValue => ({
  start: start ? new Date(start) : null,
  end: end ? new Date(end) : null,
})

function toUrlSearch(params: {
  page: number
  limit: number
  start?: string
  end?: string
}): CarTelemetryRecordsSearch {
  return {
    page: params.page > 1 ? params.page : undefined,
    limit: params.limit !== DEFAULT_LIMIT ? params.limit : undefined,
    start: params.start,
    end: params.end,
  }
}

function mergeUrlSearch(
  previous: unknown,
  next: CarTelemetryRecordsSearch,
): CarTelemetryRecordsSearch {
  return {
    ...(previous !== null && typeof previous === 'object'
      ? (previous as CarTelemetryRecordsSearch)
      : {}),
    ...next,
  }
}
