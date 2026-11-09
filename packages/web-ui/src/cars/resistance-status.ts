import {
  RESISTANCE_ALERT_THRESHOLD_OHMS,
  RESISTANCE_OK_MAX_OHMS,
  isResistanceOpenLine,
} from '@fuel-carrier/shared-types/car-telemetry'

export type ResistanceStatus = 'success' | 'warning' | 'error'

export function getResistanceStatus(value: number): ResistanceStatus {
  if (value < RESISTANCE_OK_MAX_OHMS) {
    return 'success'
  }

  if (value <= RESISTANCE_ALERT_THRESHOLD_OHMS) {
    return 'warning'
  }

  return 'error'
}

export function getWorstResistanceStatus(values: number[]): ResistanceStatus {
  let worst: ResistanceStatus = 'success'

  for (const value of values) {
    const status = getResistanceStatus(value)

    if (status === 'error') {
      return 'error'
    }

    if (status === 'warning') {
      worst = 'warning'
    }
  }

  return worst
}

export type ResistanceStatusStyles = {
  border: string
  bg: string
  glow: string
  text: string
  badge: string
  icon: string
  pulse: string
}

export function getResistanceStatusStyles(
  status: ResistanceStatus,
): ResistanceStatusStyles {
  switch (status) {
    case 'success':
      return {
        border: 'border-success/35',
        bg: 'bg-success/10',
        glow: 'shadow-[0_0_28px_-10px] shadow-success/45',
        text: 'text-success',
        badge: 'border-success/30 bg-success/15',
        icon: 'text-success',
        pulse: '',
      }
    case 'warning':
      return {
        border: 'border-warning/40',
        bg: 'bg-warning/12',
        glow: 'shadow-[0_0_32px_-8px] shadow-warning/50',
        text: 'text-warning',
        badge: 'border-warning/35 bg-warning/15',
        icon: 'text-warning',
        pulse: 'animate-pulse',
      }
    case 'error':
      return {
        border: 'border-error/45',
        bg: 'bg-error/12',
        glow: 'shadow-[0_0_36px_-6px] shadow-error/55',
        text: 'text-error',
        badge: 'border-error/40 bg-error/15',
        icon: 'text-error',
        pulse: 'animate-pulse',
      }
  }
}

export function formatResistanceValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function formatResistanceMeasure({
  value,
  unit,
  openLine,
  empty,
}: {
  value: number | undefined
  unit: string
  openLine: string
  empty: string
}): string {
  if (value == null || !Number.isFinite(value)) {
    return empty
  }

  if (isResistanceOpenLine(value)) {
    return openLine
  }

  return `${formatResistanceValue(value)} ${unit}`
}
