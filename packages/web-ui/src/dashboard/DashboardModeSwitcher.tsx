import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { ChangeEvent } from 'react'
import { cn } from '../utils'
import { Select } from '../ui/Select'
import { useDashboardMode } from './DashboardModeProvider'
import {
  DASHBOARD_MODES,
  isDashboardMode,
  type DashboardMode,
} from './dashboard-mode'

export type DashboardModeSwitcherProps = {
  className?: string
}

export function DashboardModeSwitcher({
  className,
}: DashboardModeSwitcherProps) {
  const { LL } = useI18nContext()
  const { mode, setMode } = useDashboardMode()

  function modeLabel(value: DashboardMode): string {
    if (value === 'truckState') {
      return LL.common.dashboardMode.truckState()
    }

    return LL.common.dashboardMode.fuelLevel()
  }

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextMode = event.target.value
    if (isDashboardMode(nextMode)) {
      setMode(nextMode)
    }
  }

  return (
    <div className="grid w-full min-w-0 max-w-full sm:w-max sm:max-w-[min(36rem,calc(100vw-14rem))]">
      <span
        aria-hidden
        className="invisible col-start-1 row-start-1 whitespace-pre px-8 text-sm"
      >
        {modeLabel(mode)}
      </span>
      <div className="col-start-1 row-start-1 min-w-0">
        <Select
          aria-label={LL.common.dashboardMode.label()}
          title={modeLabel(mode)}
          value={mode}
          onChange={handleChange}
          className={cn(
            'h-11 min-h-11 w-full min-w-0 max-w-full tracking-normal',
            className,
          )}
        >
          {DASHBOARD_MODES.map((option) => (
            <option key={option} value={option}>
              {modeLabel(option)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
