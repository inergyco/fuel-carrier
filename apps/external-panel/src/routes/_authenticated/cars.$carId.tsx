import { createFileRoute } from '@tanstack/react-router'
import { parsePaginationSearch } from '@fuel-carrier/web-ui/ui'
import { CarDetailPage } from '../../components/cars/CarDetailPage'

export const Route = createFileRoute('/_authenticated/cars/$carId')({
  validateSearch: parsePaginationSearch,
  component: CarDetailRoute,
})

function CarDetailRoute() {
  const { carId } = Route.useParams()

  return <CarDetailPage carId={carId} />
}
