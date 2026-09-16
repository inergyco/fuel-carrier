import type { Car } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { CarOverviewSection as SharedCarOverviewSection } from '@fuel-carrier/web-ui/cars'

interface CarOverviewSectionProps {
  car: Car
  currentDriverName: string
}

export function CarOverviewSection({
  car,
  currentDriverName,
}: CarOverviewSectionProps) {
  const { LL } = useI18nContext()

  return (
    <SharedCarOverviewSection
      car={car}
      labels={LL.externalPanel.cars}
      currentDriverName={currentDriverName}
    />
  )
}
