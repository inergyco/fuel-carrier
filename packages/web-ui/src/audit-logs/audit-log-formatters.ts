import type { AuditLog } from '@fuel-carrier/shared-types'
import { AuditActions } from '@fuel-carrier/shared-types'

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
  [AuditActions.COMPANY_CREATED]: 'companyCreated',
  [AuditActions.COMPANY_UPDATED]: 'companyUpdated',
  [AuditActions.COMPANY_DELETED]: 'companyDeleted',
  [AuditActions.COMPANY_USER_CREATED]: 'companyUserCreated',
  [AuditActions.COMPANY_USER_UPDATED]: 'companyUserUpdated',
  [AuditActions.COMPANY_USER_DELETED]: 'companyUserDeleted',
  [AuditActions.DRIVER_CREATED]: 'driverCreated',
  [AuditActions.DRIVER_UPDATED]: 'driverUpdated',
  [AuditActions.DRIVER_DELETED]: 'driverDeleted',
  [AuditActions.CAR_CREATED]: 'carCreated',
  [AuditActions.CAR_UPDATED]: 'carUpdated',
  [AuditActions.CAR_DELETED]: 'carDeleted',
  [AuditActions.CAR_MQTT_CREDENTIALS_PROVISIONED]: 'carMqttCredentialsProvisioned',
  [AuditActions.CAR_MQTT_CREDENTIALS_ROTATED]: 'carMqttCredentialsRotated',
  [AuditActions.AUTH_LOGIN_SUCCEEDED]: 'authLoginSucceeded',
  [AuditActions.AUTH_LOGIN_FAILED]: 'authLoginFailed',
  [AuditActions.AUTH_LOGOUT]: 'authLogout',
  [AuditActions.AUTH_PASSWORD_CHANGED]: 'authPasswordChanged',
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
