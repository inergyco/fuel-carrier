import type { AuditLog } from '@fuel-carrier/shared-types'
import { api } from '../api'

export const auditLogKeys = {
  all: ['audit-logs'] as const,
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  return api.get('audit-logs').json<AuditLog[]>()
}
