import type {
  AuditLog,
  PaginatedResult,
  PaginationParams,
} from "@fuel-carrier/shared-types";
import { DEFAULT_LIMIT } from "@fuel-carrier/shared-types";
import { api } from "./api";

export const auditLogKeys = {
  all: (params: PaginationParams = { page: 1, limit: DEFAULT_LIMIT }) =>
    ["audit-logs", params] as const,
  company: (
    companyId: string,
    params: PaginationParams = { page: 1, limit: DEFAULT_LIMIT },
  ) => ["audit-logs", companyId, params] as const,
};

export async function fetchAuditLogs(
  searchParams: PaginationParams = { page: 1, limit: DEFAULT_LIMIT },
): Promise<PaginatedResult<AuditLog>> {
  return api
    .get("audit-logs", { searchParams })
    .json<PaginatedResult<AuditLog>>();
}

export async function fetchCompanyAuditLogs(
  companyId: string,
  searchParams: PaginationParams = { page: 1, limit: DEFAULT_LIMIT },
): Promise<PaginatedResult<AuditLog>> {
  return api
    .get(`companies/${companyId}/audit-logs`, { searchParams })
    .json<PaginatedResult<AuditLog>>();
}
