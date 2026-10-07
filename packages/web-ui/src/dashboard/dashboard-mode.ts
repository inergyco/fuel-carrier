export const DASHBOARD_MODES = ['fuelLevel', 'truckState'] as const

export type DashboardMode = (typeof DASHBOARD_MODES)[number]

export function isDashboardMode(value: string | null): value is DashboardMode {
  return DASHBOARD_MODES.some((mode) => mode === value)
}

export function readStoredDashboardMode(storageKey: string): DashboardMode {
  try {
    const value = localStorage.getItem(storageKey)
    if (isDashboardMode(value)) {
      return value
    }
  } catch {
    // Ignore private-mode failures.
  }

  return 'fuelLevel'
}

export function writeStoredDashboardMode(
  storageKey: string,
  mode: DashboardMode,
) {
  try {
    localStorage.setItem(storageKey, mode)
  } catch {
    // Ignore quota / private-mode failures.
  }
}
