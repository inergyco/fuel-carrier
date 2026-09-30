import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  DEFAULT_LIMIT,
  FUEL_GRADE_FILTERS,
  FUEL_LEVEL_FILTERS,
  MAX_LIMIT,
  type FuelGradeFilter,
  type FuelLevelFilter,
  type ResourceListParams,
} from '@fuel-carrier/shared-types'
import { useDebouncedValue } from './useDebouncedValue'
import {
  parsePaginationSearch,
  type PaginationSearch,
} from './usePagination'

const RESOURCE_LIST_SEARCH_MAX_LENGTH = 64
const FUEL_GRADE_VALUES = new Set<string>(FUEL_GRADE_FILTERS)
const FUEL_LEVEL_VALUES = new Set<string>(FUEL_LEVEL_FILTERS)

/** Optional list filters on top of `?page=&limit=`. */
export type ResourceListSearch = PaginationSearch & {
  search?: string
  fuelGrade?: FuelGradeFilter
  fuelLevel?: FuelLevelFilter
}

/** Trim, cap length, and treat blank as no search filter. */
export function normalizeResourceListSearchText(
  searchText: string,
): string | undefined {
  const trimmed = searchText.trim().slice(0, RESOURCE_LIST_SEARCH_MAX_LENGTH)
  return trimmed.length > 0 ? trimmed : undefined
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
    const searchText = normalizeResourceListSearchText(search.search)
    if (searchText) {
      result.search = searchText
    }
  }

  if (
    typeof search.fuelGrade === 'string' &&
    FUEL_GRADE_VALUES.has(search.fuelGrade) &&
    search.fuelGrade !== 'all'
  ) {
    result.fuelGrade = search.fuelGrade as FuelGradeFilter
  }

  if (
    typeof search.fuelLevel === 'string' &&
    FUEL_LEVEL_VALUES.has(search.fuelLevel) &&
    search.fuelLevel !== 'all'
  ) {
    result.fuelLevel = search.fuelLevel as FuelLevelFilter
  }

  return result
}

function toUrlSearch(params: ResourceListParams): ResourceListSearch {
  return {
    page: params.page > 1 ? params.page : undefined,
    limit: params.limit !== DEFAULT_LIMIT ? params.limit : undefined,
    search: params.search,
    fuelGrade:
      params.fuelGrade && params.fuelGrade !== 'all'
        ? params.fuelGrade
        : undefined,
    fuelLevel:
      params.fuelLevel && params.fuelLevel !== 'all'
        ? params.fuelLevel
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
 * Syncs list pagination + search/fuel filters with the current route URL.
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
    fuelGrade: parsed.fuelGrade ?? 'all',
    fuelLevel: parsed.fuelLevel ?? 'all',
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

  const draftSearch = normalizeResourceListSearchText(draftSearchText)
  const debouncedSearch = useDebouncedValue(draftSearch)

  useEffect(() => {
    // Draft already matches the URL (e.g. browser back synced the input).
    if (draftSearch === listParams.search) {
      return
    }

    // Still waiting for the draft to settle.
    if (debouncedSearch !== draftSearch) {
      return
    }

    void navigate({
      to: '.',
      search: (previous: unknown) =>
        mergeUrlSearch(
          previous,
          toUrlSearch({
            page: 1,
            limit: listParams.limit,
            fuelGrade: listParams.fuelGrade,
            fuelLevel: listParams.fuelLevel,
            search: debouncedSearch,
          }),
        ),
      replace: true,
    })
  }, [
    draftSearch,
    debouncedSearch,
    listParams.search,
    listParams.limit,
    listParams.fuelGrade,
    listParams.fuelLevel,
    navigate,
  ])

  function setFuelGrade(fuelGrade: FuelGradeFilter) {
    patchListParams({ page: 1, fuelGrade })
  }

  function setFuelLevel(fuelLevel: FuelLevelFilter) {
    patchListParams({ page: 1, fuelLevel })
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
    setFuelGrade,
    setFuelLevel,
    handlePageChange,
    handleLimitChange,
    hasActiveFilters:
      Boolean(listParams.search) ||
      listParams.fuelGrade !== 'all' ||
      listParams.fuelLevel !== 'all',
  }
}
