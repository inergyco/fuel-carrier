import type { AuditLog } from '@fuel-carrier/shared-types'
import { AuditAction } from '@fuel-carrier/shared-types'

export type AuditLogLabels = {
  actions: Record<string, () => string>
  fields: Record<string, () => string>
  roleInternalAdmin: () => string
  roleCompanyUser: () => string
  roleUnknown: () => string
  deletedSnapshot: () => string
  noDetails: () => string
  when: () => string
  actor: () => string
  action: () => string
  details: () => string
}

const ACTION_LABEL_KEYS: Record<string, string> = {
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

export function formatAuditValue(value: unknown): string {
  if (value == null || value === '') {
    return '—'
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  return JSON.stringify(value)
}

export function formatAuditRole(role: string, labels: AuditLogLabels): string {
  if (role === 'internal_admin') {
    return labels.roleInternalAdmin()
  }

  if (role === 'company_user') {
    return labels.roleCompanyUser()
  }

  return labels.roleUnknown()
}

export function formatAuditAction(
  action: string,
  labels: AuditLogLabels,
): string {
  const key = ACTION_LABEL_KEYS[action]
  if (key && key in labels.actions) {
    return labels.actions[key]()
  }

  return action
}

export function formatAuditFieldLabel(
  field: string,
  labels: AuditLogLabels,
): string {
  if (field in labels.fields) {
    return labels.fields[field]()
  }

  return field
}

export function formatAuditTimestamp(log: AuditLog, locale: string): string {
  const date =
    log.createdAt instanceof Date ? log.createdAt : new Date(log.createdAt)
  return date.toLocaleString(locale)
}
