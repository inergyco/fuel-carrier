import { isResistanceOpenLine } from '@fuel-carrier/shared-types/car-telemetry'
import { useI18nContext } from '@fuel-carrier/i18n/react'
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
  const { LL } = useI18nContext()
  const status = getResistanceStatus(value)
  const styles = getResistanceStatusStyles(status)
  const StatusIcon = resistanceStatusIcon(status)
  const openLine = isResistanceOpenLine(value)
  const reading = openLine
    ? LL.common.carTelemetry.resistanceOpenLine()
    : formatResistanceValue(value)
  const readingFont = openLine
    ? 'font-sans tracking-normal'
    : 'font-mono tabular-nums'

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${readingFont} ${styles.badge} ${styles.text} ${className}`}
      >
        <StatusIcon
          className={`size-3 shrink-0 ${styles.icon} ${styles.pulse}`}
          aria-hidden
        />
        {reading}
        {openLine ? null : unit}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold ${readingFont} ${styles.text} ${className}`}
    >
      <StatusIcon
        className={`size-4 shrink-0 ${styles.icon} ${styles.pulse}`}
        aria-hidden
      />
      {reading}
      {openLine ? null : (
        <span className="text-sm font-medium opacity-70">{unit}</span>
      )}
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
