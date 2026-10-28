import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import {
  ICON_STROKE_WIDTH,
  iconButtonClassName,
  iconMdClassName,
} from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { Link, useRouter } from '@tanstack/react-router'
import type { MouseEvent } from 'react'

export type AppBarBackLinkProps =
  | {
      to: '/companies'
      label: string
    }
  | {
      to: '/companies/$companyId'
      companyId: string
      label: string
    }
  | {
      to: '/companies/$companyId/cars'
      companyId: string
      label: string
    }
  | {
      to: '/companies/$companyId/cars/$carId'
      companyId: string
      carId: string
      label: string
    }

export function AppBarBackLink(props: AppBarBackLinkProps) {
  const router = useRouter()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!router.history.canGoBack()) return
    event.preventDefault()
    router.history.back()
  }

  const icon = (
    <ArrowLeft
      className={cn(iconMdClassName, 'rtl:rotate-180')}
      strokeWidth={ICON_STROKE_WIDTH}
      aria-hidden
    />
  )

  if (props.to === '/companies/$companyId/cars/$carId') {
    return (
      <Link
        to="/companies/$companyId/cars/$carId"
        params={{ companyId: props.companyId, carId: props.carId }}
        aria-label={props.label}
        className={iconButtonClassName}
        onClick={handleClick}
      >
        {icon}
      </Link>
    )
  }

  if (props.to === '/companies/$companyId/cars') {
    return (
      <Link
        to="/companies/$companyId/cars"
        params={{ companyId: props.companyId }}
        aria-label={props.label}
        className={iconButtonClassName}
        onClick={handleClick}
      >
        {icon}
      </Link>
    )
  }

  if (props.to === '/companies/$companyId') {
    return (
      <Link
        to="/companies/$companyId"
        params={{ companyId: props.companyId }}
        aria-label={props.label}
        className={iconButtonClassName}
        onClick={handleClick}
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
      onClick={handleClick}
    >
      {icon}
    </Link>
  )
}
