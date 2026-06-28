import { createFileRoute } from '@tanstack/react-router'
import { CompanyAuditLogsSection } from '../../components/companies/detail/CompanyAuditLogsSection'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/audit-logs',
)({
  component: CompanyAuditLogsPage,
})

function CompanyAuditLogsPage() {
  const { companyId } = Route.useParams()

  return <CompanyAuditLogsSection companyId={companyId} />
}
