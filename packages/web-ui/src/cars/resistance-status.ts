export type ResistanceStatus = 'success' | 'warning' | 'error'

export function getResistanceStatus(value: number): ResistanceStatus {
  if (value < 5) {
    return 'success'
  }

  if (value <= 10) {
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
