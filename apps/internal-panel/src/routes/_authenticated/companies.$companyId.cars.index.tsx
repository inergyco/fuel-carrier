import { createFileRoute } from '@tanstack/react-router'
import { parseResourceListSearch } from '@fuel-carrier/web-ui/ui'
import { CompanyCarsSection } from '../../components/companies/detail/CompanyCarsSection'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/cars/',
)({
  validateSearch: parseResourceListSearch,
  component: CompanyCarsPage,
})

function CompanyCarsPage() {
  const { companyId } = Route.useParams()

  return <CompanyCarsSection companyId={companyId} />
}
