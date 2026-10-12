import type {
  AuditLog,
  AuditLogListParams,
  PaginatedResult,
} from "@fuel-carrier/shared-types";
import { DEFAULT_LIMIT } from "@fuel-carrier/shared-types";
import { toAuditLogListSearchParams } from "@fuel-carrier/web-ui/audit-logs";
import { api } from "@fuel-carrier/web-ui/api";

const DEFAULT_LIST_PARAMS: AuditLogListParams = {
  page: 1,
  limit: DEFAULT_LIMIT,
};

export const auditLogKeys = {
  all: (params: AuditLogListParams = DEFAULT_LIST_PARAMS) =>
    ["audit-logs", params] as const,
  company: (
    companyId: string,
    params: AuditLogListParams = DEFAULT_LIST_PARAMS,
  ) => ["audit-logs", companyId, params] as const,
};

export async function fetchAuditLogs(
  params: AuditLogListParams = DEFAULT_LIST_PARAMS,
): Promise<PaginatedResult<AuditLog>> {
  return api
    .get("audit-logs", { searchParams: toAuditLogListSearchParams(params) })
    .json<PaginatedResult<AuditLog>>();
}

export async function fetchCompanyAuditLogs(
  companyId: string,
  params: AuditLogListParams = DEFAULT_LIST_PARAMS,
): Promise<PaginatedResult<AuditLog>> {
  return api
    .get(`companies/${companyId}/audit-logs`, {
      searchParams: toAuditLogListSearchParams(params),
    })
    .json<PaginatedResult<AuditLog>>();
}
