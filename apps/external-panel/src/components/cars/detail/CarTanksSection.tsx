import { useI18nContext } from '@fuel-carrier/i18n/react'
import { ArrowRight, Droplets, Gauge } from '@fuel-carrier/web-ui/icons'
import {
  DEFAULT_TANK_CAPACITY_LITERS,
  DEFAULT_TANK_COUNT,
  distributeRemainFuel,
  formatVolume,
  FuelTruckDiagram,
} from '../fuel-truck'
import { useCarTelemetryLive } from '../../map/useCarTelemetryLive'

type CarTanksSectionProps = {
  carId: string
}

export function CarTanksSection({ carId }: CarTanksSectionProps) {
  const { LL } = useI18nContext()
  const telemetryQuery = useCarTelemetryLive()
  const telemetry = (telemetryQuery.data ?? []).find(function matchCar(marker) {
    return marker.carId === carId
  })

  const unitLabel = LL.externalPanel.cars.tankUnit()
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
        capacityLabel={LL.externalPanel.cars.tankCapacity({ volume: volumeText })}
        className="border-primary/10 bg-linear-to-b from-primary/8 via-base-200/50 to-base-200/20 shadow-[0_0_40px_-18px] shadow-primary/40"
      />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium tabular-nums text-primary backdrop-blur-xl">
          <Droplets className="size-4 shrink-0" aria-hidden />
          {telemetry?.remainFuel != null
            ? LL.externalPanel.cars.remainFuel({
                volume: `${formatVolume(telemetry.remainFuel)} ${unitLabel}`,
              })
            : LL.externalPanel.cars.remainFuelUnknown()}
        </div>
        {fillPercent != null ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-base-content/10 bg-base-200/60 px-3 py-2 text-xs tabular-nums text-base-content/55 backdrop-blur-xl">
            <Gauge className="size-3.5 shrink-0 text-primary/80" aria-hidden />
            {fillPercent}%
          </div>
        ) : null}
      </div>

      <ResistancePanel resistance={telemetry?.resistance} />
    </div>
  )
}

type ResistancePanelProps = {
  resistance?: {
    tankToGround: number
    tankToNozzle: number
    groundToVehicle: number
  }
}

function ResistancePanel({ resistance }: ResistancePanelProps) {
  const { LL } = useI18nContext()
  const unit = LL.externalPanel.cars.resistanceUnit()

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 p-4 shadow-[0_0_32px_-20px] shadow-primary/30 backdrop-blur-xl sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Gauge className="size-4" aria-hidden />
        </span>
        <h3 className="text-sm font-semibold tracking-tight">
          {LL.externalPanel.cars.resistanceTitle()}
        </h3>
      </div>

      {resistance == null ? (
        <p className="text-sm text-base-content/50">
          {LL.externalPanel.cars.resistanceUnknown()}
        </p>
      ) : (
        <dl className="grid gap-3 sm:grid-cols-3">
          <ResistanceStat
            fromLabel={LL.externalPanel.cars.resistanceTank()}
            toLabel={LL.externalPanel.cars.resistanceGround()}
            value={resistance.tankToGround}
            unit={unit}
          />
          <ResistanceStat
            fromLabel={LL.externalPanel.cars.resistanceTank()}
            toLabel={LL.externalPanel.cars.resistanceNozzle()}
            value={resistance.tankToNozzle}
            unit={unit}
          />
          <ResistanceStat
            fromLabel={LL.externalPanel.cars.resistanceGround()}
            toLabel={LL.externalPanel.cars.resistanceVehicle()}
            value={resistance.groundToVehicle}
            unit={unit}
          />
        </dl>
      )}
    </section>
  )
}

type ResistanceStatProps = {
  fromLabel: string
  toLabel: string
  value: number
  unit: string
}

function ResistanceStat({
  fromLabel,
  toLabel,
  value,
  unit,
}: ResistanceStatProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-base-content/8 bg-base-100/40 px-3 py-3 transition-all hover:border-primary/25 hover:bg-primary/5">
      <div
        aria-hidden
        className="pointer-events-none absolute -end-6 -top-6 size-16 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100"
      />
      <dt className="relative">
        <span
          dir="ltr"
          className="inline-flex items-center gap-1.5 text-xs text-base-content/50"
        >
          <span>{fromLabel}</span>
          <ArrowRight className="size-3.5 shrink-0 text-primary" aria-hidden />
          <span>{toLabel}</span>
        </span>
      </dt>
      <dd className="flex items-center gap-1 relative mt-2 font-mono text-lg font-semibold tabular-nums tracking-tight text-base-content">
        <span className="ms-1 text-sm font-medium text-base-content/45">
          {unit}
        </span>
        {value}
      </dd>
    </div>
  )
}
