import { ArrowRight } from '../icons/index'
import { ResistanceValue } from './ResistanceValue'
import {
  formatResistanceValue,
  getResistanceStatus,
  getResistanceStatusStyles,
} from './resistance-status'

export type ResistanceStatProps = {
  fromLabel: string
  toLabel: string
  value: number
  unit: string
}

export function ResistanceStat({
  fromLabel,
  toLabel,
  value,
  unit,
}: ResistanceStatProps) {
  const status = getResistanceStatus(value)
  const styles = getResistanceStatusStyles(status)

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border px-4 py-4 transition-all sm:px-5 sm:py-4 ${styles.border} ${styles.bg} ${styles.glow} hover:scale-[1.02]`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -end-6 -top-6 size-20 rounded-full blur-2xl transition-opacity group-hover:opacity-100 ${styles.bg}`}
      />
      <span
        aria-hidden
        className={`absolute end-3 top-3 size-2 rounded-full bg-current opacity-80 ${styles.text} ${styles.pulse}`}
      />
      <dt className="relative">
        <span
          dir="ltr"
          className="inline-flex items-center gap-1.5 text-xs text-base-content/50"
        >
          <span>{fromLabel}</span>
          <ArrowRight
            className={`size-3.5 shrink-0 ${styles.icon}`}
            aria-hidden
          />
          <span>{toLabel}</span>
        </span>
      </dt>
      <dd className="relative mt-2.5 text-lg tracking-tight">
        <ResistanceValue value={value} unit={unit} />
        <span className="sr-only">
          {formatResistanceValue(value)} {unit}, status {status}
        </span>
      </dd>
    </div>
  )
}
