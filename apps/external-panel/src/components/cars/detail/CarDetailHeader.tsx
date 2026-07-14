import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { CarDetailBackLink } from './CarDetailBackLink'

interface CarDetailHeaderProps {
  car: Car
}

export function CarDetailHeader({ car }: CarDetailHeaderProps) {
  const { LL } = useI18nContext()
  const title =
    car.name?.trim() || car.licensePlate || LL.externalPanel.cars.detailTitle()

  return (
    <div className="mb-6">
      <CarDetailBackLink />
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-1 font-mono text-sm text-base-content/50">
        {car.licensePlate}
      </p>
    </div>
  )
}

export function CarDetailLoadingHeader() {
  const { LL } = useI18nContext()

  return (
    <div className="mb-6">
      <CarDetailBackLink />
      <p className="text-sm text-base-content/50">{LL.externalPanel.cars.loading()}</p>
    </div>
  )
}
