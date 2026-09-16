import type { ReactNode, Ref, SelectHTMLAttributes } from 'react'
import { cn } from '../utils'
import { Field } from './Field'
import { useFieldIds } from './useFieldIds'

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
  id: idProp,
  ...props
}: SelectProps) {
  const { id, errorId } = useFieldIds({ id: idProp, error })

  return (
    <Field label={label} error={error} htmlFor={id} errorId={errorId}>
      <select
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          'select select-sm h-10 w-full rounded-lg border text-sm tracking-wide',
          'border-base-content/10 bg-base-200 text-base-content',
          'focus:outline-none focus:ring-1 focus:ring-primary/40',
          error ? 'border-error/60 focus:ring-error/40' : undefined,
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
}
