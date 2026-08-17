import { useI18nContext } from '@fuel-carrier/i18n/react'
import { CarTanksSection as SharedCarTanksSection } from '@fuel-carrier/web-ui/cars'

type CarTanksSectionProps = {
  carId: string
}

export function CarTanksSection({ carId }: CarTanksSectionProps) {
  const { LL } = useI18nContext()

  return (
    <SharedCarTanksSection carId={carId} labels={LL.externalPanel.cars} />
  )
}
