import { createFileRoute } from '@tanstack/react-router'
import { parseCarTelemetryRecordsSearch } from '@fuel-carrier/web-ui/cars'
import { CarFuelMovementsPage } from '../../components/cars/CarFuelMovementsPage'

export const Route = createFileRoute('/panel/cars/$carId/fuel-movements')({
  validateSearch: parseCarTelemetryRecordsSearch,
  component: CarFuelMovementsRoute,
})

function CarFuelMovementsRoute() {
  const { carId } = Route.useParams()

  return <CarFuelMovementsPage carId={carId} />
}
