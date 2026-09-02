import { Gauge } from '../icons/index'
import { ResistanceStat } from './ResistanceStat'
import {
  getResistanceStatusStyles,
  getWorstResistanceStatus,
} from './resistance-status'

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

export function ResistancePanel({ labels, resistance }: ResistancePanelProps) {
  const unit = labels.resistanceUnit()
  const panelStatus =
    resistance == null
      ? null
      : getWorstResistanceStatus([
          resistance.tankToGround,
          resistance.tankToNozzle,
          resistance.groundToVehicle,
        ])
  const panelStyles =
    panelStatus == null ? null : getResistanceStatusStyles(panelStatus)

  return (
    <section
      className={`rounded-2xl border bg-base-200/40 p-5 backdrop-blur-xl transition-all sm:p-6 ${
        panelStyles == null
          ? 'border-base-content/8 shadow-[0_0_32px_-20px] shadow-primary/30'
          : `${panelStyles.border} ${panelStyles.glow}`
      }`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex size-8 items-center justify-center rounded-lg ${
              panelStyles == null
                ? 'bg-primary/15 text-primary'
                : `${panelStyles.bg} ${panelStyles.icon}`
            }`}
          >
            <Gauge className="size-4" aria-hidden />
          </span>
          <h3 className="text-sm font-semibold tracking-tight">
            {labels.resistanceTitle()}
          </h3>
        </div>
        {resistance != null ? (
          <ResistanceThresholdLegend unit={unit} />
        ) : null}
      </div>

      {resistance == null ? (
        <p className="text-sm text-base-content/50">
          {labels.resistanceUnknown()}
        </p>
      ) : (
        <dl className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <ResistanceStat
            fromLabel={labels.resistanceTank()}
            toLabel={labels.resistanceGround()}
            value={resistance.tankToGround}
            unit={unit}
          />
          <ResistanceStat
            fromLabel={labels.resistanceTank()}
            toLabel={labels.resistanceNozzle()}
            value={resistance.tankToNozzle}
            unit={unit}
          />
          <ResistanceStat
            fromLabel={labels.resistanceGround()}
            toLabel={labels.resistanceVehicle()}
            value={resistance.groundToVehicle}
            unit={unit}
          />
        </dl>
      )}
    </section>
  )
}

type ResistanceThresholdLegendProps = {
  unit: string
}

function ResistanceThresholdLegend({ unit }: ResistanceThresholdLegendProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-base-content/45"
      aria-hidden
    >
      <ThresholdChip label={`<5${unit}`} status="success" />
      <ThresholdChip label={`5–10${unit}`} status="warning" />
      <ThresholdChip label={`>10${unit}`} status="error" />
    </div>
  )
}

type ThresholdChipProps = {
  label: string
  status: 'success' | 'warning' | 'error'
}

function ThresholdChip({ label, status }: ThresholdChipProps) {
  const styles = getResistanceStatusStyles(status)

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${styles.badge}`}
    >
      <span
        className={`size-1.5 rounded-full bg-current ${styles.text} ${styles.pulse}`}
      />
      <span className={`tabular-nums ${styles.text}`}>{label}</span>
    </span>
  )
}
