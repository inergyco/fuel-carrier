import type { CarFuelMovement } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { formatVolume } from '../fuel-truck'
import {
  formatMeasure,
  formatRecordTimestamp,
} from '../telemetry-records/formatTelemetryRecord'
import { TelemetryModeBadge } from '../telemetry-records/TelemetryModeBadge'

type CarFuelMovementCardsProps = {
  movements: CarFuelMovement[]
}

export function CarFuelMovementCards({ movements }: CarFuelMovementCardsProps) {
  const { LL, locale } = useI18nContext()
  const labels = LL.common.carFuelMovements

  return (
    <ul className="flex flex-col gap-3">
      {movements.map(function renderMovementCard(movement) {
        return (
          <li
            key={movement.id}
            className="rounded-2xl border border-base-content/8 bg-base-100/20 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium tracking-tight">
                {formatRecordTimestamp(movement.recordedAt, locale)}
              </p>
              <TelemetryModeBadge mode={movement.mode} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <MovementField
                label={labels.liters()}
                value={formatMeasure({
                  value: movement.liters,
                  format: formatVolume,
                  unit: labels.volumeUnit(),
                  empty: labels.emptyCell(),
                })}
              />
              <MovementField
                label={labels.pricePerLiter()}
                value={formatAmount(movement.pricePerLiter, labels.emptyCell())}
              />
              <MovementField
                label={labels.wage()}
                value={formatAmount(movement.wage, labels.emptyCell())}
              />
            </dl>
          </li>
        )
      })}
    </ul>
  )
}

function MovementField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-base-content/45">{label}</dt>
      <dd className="mt-0.5 font-mono font-medium tabular-nums break-all">
        {value}
      </dd>
    </div>
  )
}

const formatAmount = (value: number | undefined, empty: string) =>
  value == null || !Number.isFinite(value) ? empty : formatVolume(value)
