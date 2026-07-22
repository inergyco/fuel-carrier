import { useCarQuery } from './useCarQuery'
import {
  CarDetailHeader,
  CarDetailLoadingHeader,
} from './detail/CarDetailHeader'
import { CarDetailNotFound } from './detail/CarDetailNotFound'
import { CarOverviewSection } from './detail/CarOverviewSection'
import { CarTanksSection } from './detail/CarTanksSection'

interface CarDetailPageProps {
  carId: string
}

export function CarDetailPage({ carId }: CarDetailPageProps) {
  const { carQuery, isNotFound } = useCarQuery(carId)

  if (carQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <CarDetailLoadingHeader />
      </div>
    )
  }

  if (isNotFound || !carQuery.data) {
    return <CarDetailNotFound />
  }

  const car = carQuery.data

  return (
    <div className="mx-auto max-w-5xl">
      <CarDetailHeader car={car} />
      <div className="flex flex-col gap-6">
        <CarTanksSection />
        <CarOverviewSection car={car} />
      </div>
    </div>
  )
}
