import type { Ref, TextareaHTMLAttributes } from 'react'
import { cn } from '../utils'
import { Field } from './Field'
import { useFieldIds } from './useFieldIds'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({
  label,
  error,
  className,
  ref,
  id: idProp,
  ...props
}: TextareaProps) {
  const { id, errorId } = useFieldIds({ id: idProp, error })

  return (
    <Field label={label} error={error} htmlFor={id} errorId={errorId}>
      <textarea
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          'textarea textarea-sm min-h-24 w-full resize-y rounded-lg border bg-base-100/60 px-3 py-2 text-sm tracking-wide placeholder:text-base-content/20 focus:outline-none focus:ring-1',
          error
            ? 'border-error/60 focus:ring-error/40'
            : 'border-base-content/10 focus:ring-primary/40',
          className,
        )}
        {...props}
      />
    </Field>
  )
}
