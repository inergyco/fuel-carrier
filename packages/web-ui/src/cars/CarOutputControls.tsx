import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Power, PowerOff } from '../icons'
import { Button, ICON_STROKE_WIDTH, iconSmClassName } from '../ui'
import { cn } from '../utils'
import { carDetailActionClassName } from './car-detail-action-class-name'

export type CarOutputControlsProps = {
  /** Assumed active until a successful disable ACK. */
  active: boolean
  pending: boolean
  disabled?: boolean
  onToggle: () => void
}

/** Single toggle for truck GPIO outputs — cars default to active. */
export function CarOutputControls({
  active,
  pending,
  disabled = false,
  onToggle,
}: CarOutputControlsProps) {
  const { LL } = useI18nContext()
  const labels = LL.common.carOutput
  const Icon = active ? Power : PowerOff
  const label = active ? labels.active() : labels.inactive()

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        carDetailActionClassName,
        active
          ? 'border-success/25 bg-success/10 text-success'
          : 'border-error/25 bg-error/10 text-error',
      )}
      disabled={disabled || pending}
      loading={pending}
      loadingText={label}
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
