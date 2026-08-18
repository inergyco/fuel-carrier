import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils'

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'icon' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  loadingText?: ReactNode
}

export type { ButtonVariant }

export const buttonClassName: Record<ButtonVariant, string> = {
  primary:
    'btn btn-primary btn-sm h-10 w-full rounded-lg border-primary text-xs font-semibold tracking-widest uppercase shadow-none',
  outline:
    'btn btn-outline btn-primary btn-sm h-10 w-full rounded-lg border-primary bg-transparent text-primary shadow-none text-xs font-semibold tracking-widest uppercase',
  ghost: 'btn btn-ghost btn-sm h-9 min-h-9 w-auto px-2 text-xs normal-case tracking-normal',
  icon: 'btn btn-ghost btn-sm btn-circle h-9 min-h-9 w-9',
  danger:
    'btn btn-error btn-sm h-10 w-full rounded-lg text-xs font-semibold tracking-widest uppercase',
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
        buttonClassName[variant],
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
