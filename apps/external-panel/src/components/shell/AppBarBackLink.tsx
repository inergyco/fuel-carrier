import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import { ICON_STROKE_WIDTH, iconMdClassName } from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { Link } from '@tanstack/react-router'

interface AppBarBackLinkProps {
  to: '/cars'
  label: string
}

export function AppBarBackLink({ to, label }: AppBarBackLinkProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-base-content/70 transition-colors hover:bg-base-content/5 hover:text-base-content"
    >
      <ArrowLeft
        className={cn(iconMdClassName, 'rtl:rotate-180')}
        strokeWidth={ICON_STROKE_WIDTH}
        aria-hidden
      />
    </Link>
  )
}
