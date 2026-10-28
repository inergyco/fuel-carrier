import type { CarTelemetry } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { formatVolume } from '../fuel-truck'
import { formatResistanceValue } from '../resistance-status'
import {
  formatCoordinate,
  formatMeasure,
  formatRecordTimestamp,
  formatSpeed,
} from './formatTelemetryRecord'

type CarTelemetryRecordCardsProps = {
  records: CarTelemetry[]
}

export function CarTelemetryRecordCards({
  records,
}: CarTelemetryRecordCardsProps) {
  const { LL, locale } = useI18nContext()
  const labels = LL.common.carTelemetry

  return (
    <ul className="flex flex-col gap-3">
      {records.map(function renderRecordCard(record) {
        return (
          <li
            key={record.updatedAt}
            className="rounded-2xl border border-base-content/8 bg-base-100/20 p-4"
          >
            <p className="text-sm font-medium tracking-tight">
              {formatRecordTimestamp(record.updatedAt, locale)}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <RecordField
                label={labels.speed()}
                value={formatMeasure({
                  value: record.speed,
                  format: (value) => formatSpeed(value, locale),
                  unit: labels.speedUnit(),
                  empty: labels.emptyCell(),
                })}
              />
              <RecordField
                label={labels.remainFuel()}
                value={formatMeasure({
                  value: record.remainFuel,
                  format: formatVolume,
                  unit: labels.volumeUnit(),
                  empty: labels.emptyCell(),
                })}
              />
              <RecordField
                label={labels.fuelAmount()}
                value={formatMeasure({
                  value: record.fuelAmount,
                  format: formatVolume,
                  unit: labels.volumeUnit(),
                  empty: labels.emptyCell(),
                })}
              />
              <RecordField
                label={labels.latitude()}
                value={formatCoordinate(record.latitude)}
              />
              <RecordField
                label={labels.longitude()}
                value={formatCoordinate(record.longitude)}
              />
              <RecordField
                label={labels.resistanceTankToGround()}
                value={formatMeasure({
                  value: record.resistance?.tankToGround,
                  format: formatResistanceValue,
                  unit: labels.resistanceUnit(),
                  empty: labels.emptyCell(),
                })}
              />
              <RecordField
                label={labels.resistanceTankToNozzle()}
                value={formatMeasure({
                  value: record.resistance?.tankToNozzle,
                  format: formatResistanceValue,
                  unit: labels.resistanceUnit(),
                  empty: labels.emptyCell(),
                })}
              />
              <RecordField
                label={labels.resistanceGroundToVehicle()}
                value={formatMeasure({
                  value: record.resistance?.groundToVehicle,
                  format: formatResistanceValue,
                  unit: labels.resistanceUnit(),
                  empty: labels.emptyCell(),
                })}
              />
            </dl>
          </li>
        )
      })}
    </ul>
  )
}

function RecordField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-base-content/45">{label}</dt>
      <dd className="mt-1 font-mono text-base-content/85 tabular-nums break-all">
        {value}
      </dd>
    </div>
  )
}
