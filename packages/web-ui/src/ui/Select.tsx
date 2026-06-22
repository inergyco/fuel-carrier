import type { ReactNode, Ref, SelectHTMLAttributes } from 'react'
import { cn } from '../utils'
import { Field } from './Field'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  ref?: Ref<HTMLSelectElement>
  children: ReactNode
}

export function Select({
  label,
  error,
  className,
  ref,
  children,
  ...props
}: SelectProps) {
  return (
    <Field label={label} error={error}>
      <select
        ref={ref}
        className={cn(
          'select select-sm h-10 w-full rounded-lg border text-sm tracking-wide',
          'border-base-content/10 bg-base-200 text-base-content',
          'focus:outline-none focus:ring-1 focus:ring-primary/40',
          error
            ? 'border-error/60 focus:ring-error/40'
            : undefined,
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
}
