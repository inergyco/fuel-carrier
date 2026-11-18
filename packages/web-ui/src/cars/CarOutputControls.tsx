import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Power, PowerOff } from '../icons'
import { Button, ICON_STROKE_WIDTH, iconSmClassName } from '../ui'
import { cn } from '../utils'
import { carDetailActionClassName } from './car-detail-action-class-name'

export type CarOutputControlsProps = {
  /** True when truck outputs are on (default). Click sends the opposite command. */
  active: boolean
  pending: boolean
  disabled?: boolean
  onToggle: () => void
}

/** Single toggle for truck GPIO outputs — label is the next action. */
export function CarOutputControls({
  active,
  pending,
  disabled = false,
  onToggle,
}: CarOutputControlsProps) {
  const { LL } = useI18nContext()
  const labels = LL.common.carOutput
  // Outputs on → next action is disable; outputs off → enable.
  const willDisable = active
  const Icon = willDisable ? PowerOff : Power
  const label = willDisable ? labels.disable() : labels.enable()
  const loadingLabel = willDisable ? labels.disabling() : labels.enabling()

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        carDetailActionClassName,
        willDisable
          ? 'border-error/25 bg-error/10 text-error'
          : 'border-success/25 bg-success/10 text-success',
      )}
      disabled={disabled || pending}
      loading={pending}
      loadingText={loadingLabel}
      aria-pressed={active}
      onClick={onToggle}
    >
      <span className="flex items-center justify-center gap-2 whitespace-nowrap">
        <Icon
          className={iconSmClassName}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden
        />
        {label}
      </span>
    </Button>
  )
}
