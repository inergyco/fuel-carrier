import type { HTMLAttributes } from 'react'
import { cn } from '../utils'

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

export type { BadgeVariant, BadgeSize }

export const badgeClassName: Record<BadgeVariant, string> = {
  primary: 'bg-primary text-primary-content',
  secondary: 'bg-secondary text-secondary-content',
  accent: 'bg-accent text-accent-content',
  info: 'bg-info text-info-content',
  success: 'bg-success text-success-content',
  warning: 'bg-warning text-warning-content',
  error: 'bg-error text-error-content',
}

export const badgeSizeClassName: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-[11px]',
  lg: 'px-3 py-1 text-xs',
}

export function Badge({
  variant = 'info',
  size = 'md',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full font-semibold tracking-wide',
        badgeClassName[variant],
        badgeSizeClassName[size],
        className,
      )}
      {...props}
    />
  )
}
