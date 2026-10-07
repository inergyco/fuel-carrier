import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils'

const mapControlButtonClassName =
  'inline-flex size-11 min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border border-base-content/8 bg-base-200/70 text-base-content shadow-lg backdrop-blur-xl transition-all hover:bg-base-200/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40'

type MapControlButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  pressed?: boolean
  active?: boolean
  children: ReactNode
}

export function MapControlButton({
  label,
  pressed,
  active = false,
  className,
  children,
  type = 'button',
  ...props
}: MapControlButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cn(
        mapControlButtonClassName,
        active && 'border-primary bg-primary/10 text-primary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
