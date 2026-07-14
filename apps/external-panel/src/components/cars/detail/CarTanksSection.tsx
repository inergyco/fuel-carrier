import { useI18nContext } from '@fuel-carrier/i18n/react'
import { formatVolume, FuelTruckDiagram } from '../fuel-truck'

/** Placeholder until tank capacity / fill levels come from the API. */
const PLACEHOLDER_TANK_CAPACITY = 10_000
const PLACEHOLDER_TANK_FILLED = [7_200, 4_100, 8_000]

export function CarTanksSection() {
  const { LL } = useI18nContext()
  const unitLabel = LL.externalPanel.cars.tankUnit()
  const volumeText = `${formatVolume(PLACEHOLDER_TANK_CAPACITY)} ${unitLabel}`

  return (
    <FuelTruckDiagram
      capacity={PLACEHOLDER_TANK_CAPACITY}
      filled={PLACEHOLDER_TANK_FILLED}
      unitLabel={unitLabel}
      capacityLabel={LL.externalPanel.cars.tankCapacity({ volume: volumeText })}
    />
  )
}
