import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'input input-sm h-10 w-full rounded-lg border bg-base-100/60 px-3 font-mono text-sm tracking-wide placeholder:text-base-content/20 focus:outline-none focus:ring-1',
          error
            ? 'border-error/60 focus:ring-error/40'
            : 'border-base-content/10 focus:ring-primary/40',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-error/80">{error}</p>}
    </div>
  )
})
