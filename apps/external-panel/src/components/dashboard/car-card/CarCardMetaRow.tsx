import type { LucideIcon } from '@fuel-carrier/web-ui/icons'
import { ICON_STROKE_WIDTH } from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'

type CarCardMetaRowProps = {
  icon: LucideIcon
  label: string
  className?: string
  valueClassName?: string
}

export function CarCardMetaRow({
  icon: Icon,
  label,
  className,
  valueClassName,
}: CarCardMetaRowProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <Icon
        className="size-4 shrink-0 text-base-content/40"
        strokeWidth={ICON_STROKE_WIDTH}
        aria-hidden
      />
      <span
        className={cn(
          'truncate font-medium text-base-content/75',
          valueClassName,
        )}
      >
        {label}
      </span>
    </div>
  )
}
