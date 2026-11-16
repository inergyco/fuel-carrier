import type { CarTelemetry } from '@fuel-carrier/shared-types'
import { useI18nContext } from '@fuel-carrier/i18n/react'

type TelemetryMode = CarTelemetry['mode']

const MODE_CLASS_NAME: Record<TelemetryMode, string> = {
  idle: 'border-base-content/15 bg-base-content/8 text-base-content/70',
  loading: 'border-info/35 bg-info/15 text-info',
  dispensing: 'border-success/35 bg-success/15 text-success',
}

const MODE_DOT_CLASS_NAME: Record<TelemetryMode, string> = {
  idle: 'bg-base-content/50',
  loading: 'bg-info',
  dispensing: 'bg-success',
}

type TelemetryModeBadgeProps = {
  mode: TelemetryMode
}

export function TelemetryModeBadge({ mode }: TelemetryModeBadgeProps) {
  const { LL } = useI18nContext()
  const labels = LL.common.carTelemetry

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${MODE_CLASS_NAME[mode]}`}
    >
      <span
        aria-hidden
        className={`size-1.5 shrink-0 rounded-full ${MODE_DOT_CLASS_NAME[mode]}`}
      />
      {telemetryModeLabel(labels, mode)}
    </span>
  )
}

function telemetryModeLabel(
  labels: {
    modeIdle: () => string
    modeLoading: () => string
    modeDispensing: () => string
  },
  mode: TelemetryMode,
) {
  if (mode === 'loading') {
    return labels.modeLoading()
  }

  if (mode === 'dispensing') {
    return labels.modeDispensing()
  }

  return labels.modeIdle()
}
