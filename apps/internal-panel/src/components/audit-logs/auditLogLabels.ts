import type { TranslationFunctions } from '@fuel-carrier/i18n'
import type { AuditLogLabels } from '@fuel-carrier/web-ui/audit-logs'

export function getInternalAuditLogLabels(
  LL: TranslationFunctions,
): AuditLogLabels {
  const detail = LL.internalPanel.companies.detail

  return {
    actions: detail.auditLogsActions,
    fields: detail.auditLogsFields,
    roleInternalAdmin: detail.auditLogsRoleInternalAdmin,
    roleCompanyUser: detail.auditLogsRoleCompanyUser,
    roleUnknown: detail.auditLogsRoleUnknown,
    deletedSnapshot: detail.auditLogsDeletedSnapshot,
    noDetails: detail.auditLogsNoDetails,
    when: detail.auditLogsWhen,
    actor: detail.auditLogsActor,
    action: detail.auditLogsAction,
    details: detail.auditLogsDetails,
  }
}
