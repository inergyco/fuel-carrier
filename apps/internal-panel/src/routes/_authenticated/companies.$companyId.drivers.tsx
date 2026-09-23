import { createFileRoute } from '@tanstack/react-router'
import { parseResourceListSearch } from '@fuel-carrier/web-ui/ui'
import { CompanyDriversSection } from '../../components/companies/detail/CompanyDriversSection'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/drivers',
)({
  validateSearch: parseResourceListSearch,
  component: CompanyDriversPage,
})

function CompanyDriversPage() {
  const { companyId } = Route.useParams()

  return <CompanyDriversSection companyId={companyId} />
}
