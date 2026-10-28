import { createFileRoute } from '@tanstack/react-router'
import { parseCarTelemetryRecordsSearch } from '@fuel-carrier/web-ui/cars'
import { CarTelemetryPage } from '../../components/cars/CarTelemetryPage'

export const Route = createFileRoute('/panel/cars/$carId/telemetry')({
  validateSearch: parseCarTelemetryRecordsSearch,
  component: CarTelemetryRoute,
})

function CarTelemetryRoute() {
  const { carId } = Route.useParams()

  return <CarTelemetryPage carId={carId} />
}
