import { ArrowRight } from '../icons/index'
import { MetricCell, MetricColumn } from './MetricColumn'
import { ResistanceValue } from './ResistanceValue'

export type ResistancePanelLabels = {
  resistanceTitle: () => string
  resistanceUnknown: () => string
  resistanceTank: () => string
  resistanceGround: () => string
  resistanceNozzle: () => string
  resistanceVehicle: () => string
  resistanceUnit: () => string
}

export type ResistancePanelProps = {
  labels: ResistancePanelLabels
  resistance?: {
    tankToGround: number
    tankToNozzle: number
    groundToVehicle: number
  }
}

type ResistanceReading = {
  fromLabel: string
  toLabel: string
  value: number
}

export function ResistancePanel({ labels, resistance }: ResistancePanelProps) {
  if (resistance == null) {
    return (
      <div className="flex min-h-16 items-center justify-center rounded-lg border border-base-content/8 bg-base-100/30 px-3 py-3 text-center text-sm text-base-content/65">
        {labels.resistanceUnknown()}
      </div>
    )
  }

  const unit = labels.resistanceUnit()
  const readings: ResistanceReading[] = [
    {
      fromLabel: labels.resistanceTank(),
      toLabel: labels.resistanceGround(),
      value: resistance.tankToGround,
    },
    {
      fromLabel: labels.resistanceTank(),
      toLabel: labels.resistanceNozzle(),
      value: resistance.tankToNozzle,
    },
    {
      fromLabel: labels.resistanceGround(),
      toLabel: labels.resistanceVehicle(),
      value: resistance.groundToVehicle,
    },
  ]

  return (
    <MetricColumn>
      {readings.map(function renderReading(reading) {
        return (
          <MetricCell
            key={`${reading.fromLabel}-${reading.toLabel}`}
            label={
              <span dir="ltr" className="inline-flex items-center gap-1">
                <span>{reading.fromLabel}</span>
                <ArrowRight
                  className="size-3.5 shrink-0 text-base-content/35"
                  aria-hidden
                />
                <span>{reading.toLabel}</span>
              </span>
            }
            value={
              <ResistanceValue
                value={reading.value}
                unit={unit}
                className="text-base"
              />
            }
          />
        )
      })}
    </MetricColumn>
  )
}
