import { AlertCircle, AlertTriangle, CheckCircle2 } from '../icons/index'
import {
  formatResistanceValue,
  getResistanceStatus,
  getResistanceStatusStyles,
  type ResistanceStatus,
} from './resistance-status'

type ResistanceValueProps = {
  value: number
  unit?: string
  className?: string
  compact?: boolean
}

export function ResistanceValue({
  value,
  unit = 'Ω',
  className = '',
  compact = false,
}: ResistanceValueProps) {
  const status = getResistanceStatus(value)
  const styles = getResistanceStatusStyles(status)
  const StatusIcon = resistanceStatusIcon(status)

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${styles.badge} ${styles.text} ${className}`}
      >
        <StatusIcon
          className={`size-3 shrink-0 ${styles.icon} ${styles.pulse}`}
          aria-hidden
        />
        {formatResistanceValue(value)}
        {unit}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tabular-nums ${styles.text} ${className}`}
    >
      <StatusIcon
        className={`size-4 shrink-0 ${styles.icon} ${styles.pulse}`}
        aria-hidden
      />
      {formatResistanceValue(value)}
      <span className="text-sm font-medium opacity-70">{unit}</span>
    </span>
  )
}

function resistanceStatusIcon(status: ResistanceStatus) {
  switch (status) {
    case 'success':
      return CheckCircle2
    case 'warning':
      return AlertTriangle
    case 'error':
      return AlertCircle
  }
}
