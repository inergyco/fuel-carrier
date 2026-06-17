import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils'

type ButtonVariant = 'primary' | 'ghost' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  loadingText?: ReactNode
}

export type { ButtonVariant }

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'btn btn-primary btn-sm h-10 w-full rounded-lg text-xs font-semibold tracking-widest uppercase',
  ghost: 'btn btn-ghost btn-sm h-9 min-h-9 w-auto px-2 text-xs normal-case tracking-normal',
  icon: 'btn btn-ghost btn-sm btn-circle h-9 min-h-9 w-9',
}

export function Button({
  variant = 'primary',
  loading,
  loadingText,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled ?? loading}
      className={cn(
        variantClasses[variant],
        'transition-all',
        loading && 'opacity-60',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="loading loading-spinner loading-xs" />
          {loadingText ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
