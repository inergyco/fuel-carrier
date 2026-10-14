import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '../utils'

const radioOptionClassName =
  'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-base-content/10 bg-base-200/40 p-3 transition-all has-checked:border-primary/30 has-checked:bg-primary/5'

interface RadioOptionProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  title: string
  description?: string
  ref?: Ref<HTMLInputElement>
}

export function RadioOption({
  title,
  description,
  className,
  ref,
  ...props
}: RadioOptionProps) {
  return (
    <label className={cn(radioOptionClassName, className)}>
      <input
        ref={ref}
        className="radio radio-sm radio-primary mt-0.5"
        {...props}
        type="radio"
      />
      <span className="min-w-0">
        <span className="block text-sm">{title}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-base-content/50">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}
