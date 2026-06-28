import type { TranslationFunctions } from '@fuel-carrier/i18n'
import type { AuditLogLabels } from '@fuel-carrier/web-ui/audit-logs'

export function getExternalAuditLogLabels(
  LL: TranslationFunctions,
): AuditLogLabels {
  const auditLogs = LL.externalPanel.auditLogs

  return {
    actions: auditLogs.actions,
    fields: auditLogs.fields,
    roleInternalAdmin: auditLogs.roleInternalAdmin,
    roleCompanyUser: auditLogs.roleCompanyUser,
    roleUnknown: auditLogs.roleUnknown,
    deletedSnapshot: auditLogs.deletedSnapshot,
    noDetails: auditLogs.noDetails,
    when: auditLogs.when,
    actor: auditLogs.actor,
    action: auditLogs.action,
    details: auditLogs.details,
  }
}
