import { createFileRoute } from '@tanstack/react-router'
import { parseCarTelemetryRecordsSearch } from '@fuel-carrier/web-ui/cars'
import { CompanyCarTelemetryPage } from '../../components/companies/detail/CompanyCarTelemetryPage'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/cars/$carId/telemetry',
)({
  validateSearch: parseCarTelemetryRecordsSearch,
  component: CompanyCarTelemetryRoute,
})

function CompanyCarTelemetryRoute() {
  const { companyId, carId } = Route.useParams()

  return <CompanyCarTelemetryPage companyId={companyId} carId={carId} />
}
