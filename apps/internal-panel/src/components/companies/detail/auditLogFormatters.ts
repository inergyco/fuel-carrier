import type { AuditLog, AuditLogMetadata } from '@fuel-carrier/shared-types'
import { AuditAction } from '@fuel-carrier/shared-types'
import type { TranslationFunctions } from '@fuel-carrier/i18n'

const ACTION_LABEL_KEYS: Record<string, keyof TranslationFunctions['internalPanel']['companies']['detail']['auditLogsActions']> = {
  [AuditAction.COMPANY_CREATED]: 'companyCreated',
  [AuditAction.COMPANY_UPDATED]: 'companyUpdated',
  [AuditAction.COMPANY_DELETED]: 'companyDeleted',
  [AuditAction.COMPANY_USER_CREATED]: 'companyUserCreated',
  [AuditAction.COMPANY_USER_UPDATED]: 'companyUserUpdated',
  [AuditAction.COMPANY_USER_DELETED]: 'companyUserDeleted',
  [AuditAction.DRIVER_CREATED]: 'driverCreated',
  [AuditAction.DRIVER_UPDATED]: 'driverUpdated',
  [AuditAction.DRIVER_DELETED]: 'driverDeleted',
  [AuditAction.CAR_CREATED]: 'carCreated',
  [AuditAction.CAR_UPDATED]: 'carUpdated',
  [AuditAction.CAR_DELETED]: 'carDeleted',
  [AuditAction.AUTH_LOGIN_SUCCEEDED]: 'authLoginSucceeded',
  [AuditAction.AUTH_LOGIN_FAILED]: 'authLoginFailed',
  [AuditAction.AUTH_LOGOUT]: 'authLogout',
  [AuditAction.AUTH_PASSWORD_CHANGED]: 'authPasswordChanged',
}

function formatAuditValue(value: unknown): string {
  if (value == null || value === '') {
    return '—'
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  return JSON.stringify(value)
}

export function formatAuditRole(
  role: string,
  LL: TranslationFunctions,
): string {
  if (role === 'internal_admin') {
    return LL.internalPanel.companies.detail.auditLogsRoleInternalAdmin()
  }

  if (role === 'company_user') {
    return LL.internalPanel.companies.detail.auditLogsRoleCompanyUser()
  }

  return LL.internalPanel.companies.detail.auditLogsRoleUnknown()
}

export function formatAuditAction(
  action: string,
  LL: TranslationFunctions,
): string {
  const key = ACTION_LABEL_KEYS[action]
  if (key) {
    return LL.internalPanel.companies.detail.auditLogsActions[key]()
  }

  return action
}

export function formatAuditFieldLabel(
  field: string,
  LL: TranslationFunctions,
): string {
  const fields = LL.internalPanel.companies.detail.auditLogsFields

  if (field in fields) {
    return fields[field as keyof typeof fields]()
  }

  return field
}

export function formatAuditDetails(
  metadata: AuditLogMetadata,
  LL: TranslationFunctions,
): string {
  if (metadata.changes && Object.keys(metadata.changes).length > 0) {
    return Object.entries(metadata.changes)
      .map(function formatChange([field, change]) {
        const label = formatAuditFieldLabel(field, LL)
        return `${label}: ${formatAuditValue(change.from)} → ${formatAuditValue(change.to)}`
      })
      .join('\n')
  }

  if (metadata.snapshot && Object.keys(metadata.snapshot).length > 0) {
    return `${LL.internalPanel.companies.detail.auditLogsDeletedSnapshot()}\n${Object.entries(
      metadata.snapshot,
    )
      .map(function formatSnapshotField([field, value]) {
        const label = formatAuditFieldLabel(field, LL)
        return `${label}: ${formatAuditValue(value)}`
      })
      .join('\n')}`
  }

  if (metadata.username) {
    return `${formatAuditFieldLabel('username', LL)}: ${metadata.username}`
  }

  return LL.internalPanel.companies.detail.auditLogsNoDetails()
}

export function formatAuditTimestamp(log: AuditLog, locale: string): string {
  const date = log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt)
  return date.toLocaleString(locale)
}
