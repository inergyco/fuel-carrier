import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import {
  ICON_STROKE_WIDTH,
  IconButton,
  iconButtonClassName,
  iconMdClassName,
} from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { Link, useRouter } from '@tanstack/react-router'
import type { MouseEvent } from 'react'

type AppBarBackLinkProps =
  | {
      to: '/panel/cars'
      label: string
    }
  | {
      to: '/panel/cars/$carId'
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

  if (props.to === '/panel/cars/$carId') {
    return (
      <Link
        to="/panel/cars/$carId"
        params={{ carId: props.carId }}
        aria-label={props.label}
        className={iconButtonClassName}
        onClick={handleClick}
      >
        {icon}
      </Link>
    )
  }

  return (
    <IconButton
      as={Link}
      to="/panel/cars"
      aria-label={props.label}
      onClick={handleClick}
    >
      {icon}
    </IconButton>
  )
}
