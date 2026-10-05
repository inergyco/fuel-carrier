import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import {
  ICON_STROKE_WIDTH,
  IconButton,
  iconMdClassName,
} from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { Link } from '@tanstack/react-router'

interface AppBarBackLinkProps {
  to: '/cars'
  label: string
}

export function AppBarBackLink({ to, label }: AppBarBackLinkProps) {
  return (
    <IconButton as={Link} to={to} aria-label={label}>
      <ArrowLeft
        className={cn(iconMdClassName, 'rtl:rotate-180')}
        strokeWidth={ICON_STROKE_WIDTH}
        aria-hidden
      />
    </IconButton>
  )
}
