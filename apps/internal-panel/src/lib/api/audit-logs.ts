import type { AuditLog } from '@fuel-carrier/shared-types'
import { api } from './api'

export const auditLogKeys = {
  company: (companyId: string) => ['audit-logs', companyId] as const,
}

export async function fetchCompanyAuditLogs(
  companyId: string,
): Promise<AuditLog[]> {
  return api.get(`companies/${companyId}/audit-logs`).json<AuditLog[]>()
}
