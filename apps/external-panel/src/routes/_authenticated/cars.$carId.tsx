import { createFileRoute } from '@tanstack/react-router'
import { CarDetailPage } from '../../components/cars/CarDetailPage'

export const Route = createFileRoute('/_authenticated/cars/$carId')({
  component: CarDetailRoute,
})

function CarDetailRoute() {
  const { carId } = Route.useParams()

  return <CarDetailPage carId={carId} />
}
