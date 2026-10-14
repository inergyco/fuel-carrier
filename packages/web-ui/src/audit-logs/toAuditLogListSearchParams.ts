import type { AuditLogListParams } from '@fuel-carrier/shared-types'

/** Omit empty date filters so the request URL stays clean. */
export function toAuditLogListSearchParams(
  params: AuditLogListParams,
): Record<string, string | number> {
  const searchParams: Record<string, string | number> = {
    page: params.page,
    limit: params.limit,
  }

  if (params.search) {
    searchParams.search = params.search
  }

  if (params.start) {
    searchParams.start = params.start
  }

  if (params.end) {
    searchParams.end = params.end
  }

  return searchParams
}
