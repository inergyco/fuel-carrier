import { api } from '../api/index'
import { Droplets, Gauge } from '../icons/index'
import { useCarTelemetryLive } from '../map/useCarTelemetryLive'
import {
  DEFAULT_TANK_CAPACITY_LITERS,
  DEFAULT_TANK_COUNT,
  distributeRemainFuel,
  formatVolume,
  FuelTruckDiagram,
} from './fuel-truck'
import { ResistancePanel } from './ResistancePanel'

export type CarTanksSectionLabels = {
  tankUnit: () => string
  tankCapacity: (params: { volume: string }) => string
  remainFuel: (params: { volume: string }) => string
  remainFuelUnknown: () => string
  resistanceTitle: () => string
  resistanceUnknown: () => string
  resistanceTank: () => string
  resistanceGround: () => string
  resistanceNozzle: () => string
  resistanceVehicle: () => string
  resistanceUnit: () => string
}

export type CarTanksSectionProps = {
  carId: string
  labels: CarTanksSectionLabels
}

export function CarTanksSection({ carId, labels }: CarTanksSectionProps) {
  const telemetryQuery = useCarTelemetryLive(api)
  const telemetry = (telemetryQuery.data ?? []).find(function matchCar(marker) {
    return marker.carId === carId
  })

  const unitLabel = labels.tankUnit()
  const capacity = DEFAULT_TANK_CAPACITY_LITERS
  const filled =
    telemetry?.remainFuel != null
      ? distributeRemainFuel(telemetry.remainFuel)
      : [0, 0, 0]
  const volumeText = `${formatVolume(capacity)} ${unitLabel}`
  const totalCapacity = capacity * DEFAULT_TANK_COUNT
  const remainFuel = telemetry?.remainFuel ?? 0
  const fillPercent =
    telemetry?.remainFuel != null
      ? Math.min(100, Math.round((remainFuel / totalCapacity) * 100))
      : null

  return (
    <div className="flex flex-col gap-4">
      <FuelTruckDiagram
        capacity={capacity}
        filled={filled}
        unitLabel={unitLabel}
        capacityLabel={labels.tankCapacity({ volume: volumeText })}
        className="border-primary/10 bg-linear-to-b from-primary/8 via-base-200/50 to-base-200/20 shadow-[0_0_40px_-18px] shadow-primary/40"
      />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium tabular-nums text-primary backdrop-blur-xl">
          <Droplets className="size-4 shrink-0" aria-hidden />
          {telemetry?.remainFuel != null
            ? labels.remainFuel({
                volume: `${formatVolume(telemetry.remainFuel)} ${unitLabel}`,
              })
            : labels.remainFuelUnknown()}
        </div>
        {fillPercent != null ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-200/60 px-3 py-2 text-xs tabular-nums text-base-content/55 backdrop-blur-xl">
            <Gauge className="size-3.5 shrink-0 text-primary/80" aria-hidden />
            {fillPercent}%
          </div>
        ) : null}
      </div>

      <ResistancePanel labels={labels} resistance={telemetry?.resistance} />
    </div>
  )
}
