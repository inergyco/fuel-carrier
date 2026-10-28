import { api } from '../api/index'
import { useCarTelemetryLive } from '../map/useCarTelemetryLive'
import {
  DEFAULT_TANK_CAPACITY_LITERS,
  DEFAULT_TANK_COUNT,
  distributeRemainFuel,
  formatVolume,
  FuelTruckDiagram,
} from './fuel-truck'
import { MetricCell, MetricColumn } from './MetricColumn'
import { ResistancePanel } from './ResistancePanel'

export type CarTanksSectionLabels = {
  tankUnit: () => string
  tankCapacity: (params: { volume: string }) => string
  remainFuel: (params: { volume: string }) => string
  remainFuelUnknown: () => string
  fillLevel: () => string
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

function captionBeforeColon(text: string) {
  const separator = text.lastIndexOf(':')
  if (separator === -1) return text
  return text.slice(0, separator).trim()
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
  const totalCapacity = capacity * DEFAULT_TANK_COUNT
  const remainFuel = telemetry?.remainFuel ?? 0
  const fillPercent =
    telemetry?.remainFuel != null
      ? Math.min(100, Math.round((remainFuel / totalCapacity) * 100))
      : null

  return (
    <FuelTruckDiagram
      capacity={capacity}
      filled={filled}
      unitLabel={unitLabel}
      className="border-primary/10 bg-linear-to-b from-primary/8 via-base-200/50 to-base-200/20 shadow-[0_0_40px_-18px] shadow-primary/40"
      leading={
        <MetricColumn>
          <MetricCell
            label={captionBeforeColon(labels.tankCapacity({ volume: '' }))}
            value={`${formatVolume(capacity)} ${unitLabel}`}
          />
          <MetricCell
            label={captionBeforeColon(labels.remainFuel({ volume: '' }))}
            value={
              telemetry?.remainFuel != null
                ? `${formatVolume(telemetry.remainFuel)} ${unitLabel}`
                : labels.remainFuelUnknown()
            }
          />
          <MetricCell
            label={labels.fillLevel()}
            value={fillPercent != null ? `${fillPercent}%` : '—'}
          />
        </MetricColumn>
      }
      trailing={
        <ResistancePanel labels={labels} resistance={telemetry?.resistance} />
      }
    />
  )
}
