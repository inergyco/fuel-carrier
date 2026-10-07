import { ArrowLeft } from '@fuel-carrier/web-ui/icons'
import {
  ICON_STROKE_WIDTH,
  IconButton,
  iconMdClassName,
} from '@fuel-carrier/web-ui/ui'
import { cn } from '@fuel-carrier/web-ui/utils'
import { Link, useRouter } from '@tanstack/react-router'
import type { MouseEvent } from 'react'

interface AppBarBackLinkProps {
  to: '/cars'
  label: string
}

export function AppBarBackLink({ to, label }: AppBarBackLinkProps) {
  const router = useRouter()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!router.history.canGoBack()) return
    event.preventDefault()
    router.history.back()
  }

  return (
    <IconButton as={Link} to={to} aria-label={label} onClick={handleClick}>
      <ArrowLeft
        className={cn(iconMdClassName, 'rtl:rotate-180')}
        strokeWidth={ICON_STROKE_WIDTH}
        aria-hidden
      />
    </IconButton>
  )
}
