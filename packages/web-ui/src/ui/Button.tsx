import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: ReactNode
}

export function Button({ loading, loadingText, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled ?? loading}
      className={cn(
        'btn btn-primary btn-sm h-10 w-full rounded-lg text-xs font-semibold tracking-widest uppercase transition-all',
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
