import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '../utils'

const checkboxClassName =
  'checkbox checkbox-sm checkbox-primary shrink-0 rounded-md border-base-content/45 bg-transparent text-primary-content checked:border-primary checked:bg-primary [[data-theme$=light]_&]:border-base-content/70 [[data-theme$=light]_&]:bg-base-300 [[data-theme$=light]_&]:checked:bg-primary'

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ref?: Ref<HTMLInputElement>
}

export function Checkbox({ className, ref, ...props }: CheckboxProps) {
  return (
    <input
      ref={ref}
      className={cn(checkboxClassName, className)}
      {...props}
      type="checkbox"
    />
  )
}
