import { createFileRoute } from '@tanstack/react-router'
import { CompanyCarDetailPage } from '../../components/companies/detail/CompanyCarDetailPage'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/cars/$carId',
)({
  component: CompanyCarDetailRoute,
})

function CompanyCarDetailRoute() {
  const { companyId, carId } = Route.useParams()

  return <CompanyCarDetailPage companyId={companyId} carId={carId} />
}
