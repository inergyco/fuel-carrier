import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import {
  ICON_STROKE_WIDTH,
  iconButtonClassName,
  iconMdClassName,
} from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { Link } from '@tanstack/react-router'

export type AppBarBackLinkProps =
  | {
      to: '/companies'
      label: string
    }
  | {
      to: '/companies/$companyId/cars'
      companyId: string
      label: string
    }

export function AppBarBackLink(props: AppBarBackLinkProps) {
  const icon = (
    <ArrowLeft
      className={cn(iconMdClassName, 'rtl:rotate-180')}
      strokeWidth={ICON_STROKE_WIDTH}
      aria-hidden
    />
  )

  if (props.to === '/companies/$companyId/cars') {
    return (
      <Link
        to="/companies/$companyId/cars"
        params={{ companyId: props.companyId }}
        aria-label={props.label}
        className={iconButtonClassName}
      >
        {icon}
      </Link>
    )
  }

  return (
    <Link
      to="/companies"
      aria-label={props.label}
      className={iconButtonClassName}
    >
      {icon}
    </Link>
  )
}
