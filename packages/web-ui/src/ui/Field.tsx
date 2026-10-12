import type { ReactNode } from 'react'
import { cn } from '../utils'

interface FieldProps {
  label?: string
  error?: string
  htmlFor?: string
  errorId?: string
  children: ReactNode
}

export function Field({ label, error, htmlFor, errorId, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <label
          htmlFor={htmlFor}
          className={cn(
            'text-xs font-medium tracking-widest uppercase',
            error ? 'text-error' : 'text-base-content/40',
          )}
        >
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-error/80" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
