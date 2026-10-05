import type { LucideIcon } from '../../icons'
import { ICON_STROKE_WIDTH } from '../../ui/iconClassName'
import { cn } from '../../utils'

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
