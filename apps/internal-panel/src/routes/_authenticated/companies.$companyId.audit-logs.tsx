import { createFileRoute } from '@tanstack/react-router'
import { parsePaginationSearch } from '@fuel-carrier/web-ui/ui'
import { CompanyAuditLogsSection } from '../../components/companies/detail/CompanyAuditLogsSection'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/audit-logs',
)({
  validateSearch: parsePaginationSearch,
  component: CompanyAuditLogsPage,
})

function CompanyAuditLogsPage() {
  const { companyId } = Route.useParams()

  return <CompanyAuditLogsSection companyId={companyId} />
}
