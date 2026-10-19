import type { ReactNode, Ref, SelectHTMLAttributes } from 'react'
import { cn } from '../utils'
import { Field } from './Field'
import { useFieldIds } from './useFieldIds'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  ref?: Ref<HTMLSelectElement>
  /** Skip the Field wrapper when a parent already provides the label and error. */
  bare?: boolean
  children: ReactNode
}

export function Select({
  label,
  error,
  className,
  ref,
  children,
  id: idProp,
  bare = false,
  ...props
}: SelectProps) {
  const { id, errorId } = useFieldIds({ id: idProp, error })

  const select = (
    <select
      ref={ref}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={errorId}
      className={cn(
        'select h-10 min-h-10 w-full rounded-lg border bg-base-100/60 text-sm text-base-content tracking-wide',
        'border-base-content/12 text-base-content',
        'focus:outline-none focus:ring-1 focus:ring-primary/40',
        error ? 'border-error/60 focus:ring-error/40' : undefined,
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )

  if (bare) {
    return select
  }

  return (
    <Field label={label} error={error} htmlFor={id} errorId={errorId}>
      {select}
    </Field>
  )
}
