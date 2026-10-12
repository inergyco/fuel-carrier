import { createFileRoute } from '@tanstack/react-router'
import { parseAuditLogSearch } from '@fuel-carrier/web-ui/audit-logs'
import { CompanyAuditLogsSection } from '../../components/companies/detail/CompanyAuditLogsSection'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/audit-logs',
)({
  validateSearch: parseAuditLogSearch,
  component: CompanyAuditLogsPage,
})

function CompanyAuditLogsPage() {
  const { companyId } = Route.useParams()

  return <CompanyAuditLogsSection companyId={companyId} />
}
