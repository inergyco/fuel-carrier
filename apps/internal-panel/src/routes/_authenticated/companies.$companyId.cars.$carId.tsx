import { createFileRoute } from '@tanstack/react-router'
import { parsePaginationSearch } from '@fuel-carrier/web-ui/ui'
import { CompanyCarDetailPage } from '../../components/companies/detail/CompanyCarDetailPage'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/cars/$carId',
)({
  validateSearch: parsePaginationSearch,
  component: CompanyCarDetailRoute,
})

function CompanyCarDetailRoute() {
  const { companyId, carId } = Route.useParams()

  return <CompanyCarDetailPage companyId={companyId} carId={carId} />
}
