import { createFileRoute } from '@tanstack/react-router'
import { parsePaginationSearch } from '@fuel-carrier/web-ui/ui'
import { CompanyCarsSection } from '../../components/companies/detail/CompanyCarsSection'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/cars/',
)({
  validateSearch: parsePaginationSearch,
  component: CompanyCarsPage,
})

function CompanyCarsPage() {
  const { companyId } = Route.useParams()

  return <CompanyCarsSection companyId={companyId} />
}
