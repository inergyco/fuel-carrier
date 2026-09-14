import { createFileRoute } from '@tanstack/react-router'
import { parsePaginationSearch } from '@fuel-carrier/web-ui/ui'
import { CompanyDriversSection } from '../../components/companies/detail/CompanyDriversSection'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/drivers',
)({
  validateSearch: parsePaginationSearch,
  component: CompanyDriversPage,
})

function CompanyDriversPage() {
  const { companyId } = Route.useParams()

  return <CompanyDriversSection companyId={companyId} />
}
