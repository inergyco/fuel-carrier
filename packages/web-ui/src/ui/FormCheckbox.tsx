import type { InputHTMLAttributes } from 'react'
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { cn } from '../utils'
import { useFieldIds } from './useFieldIds'

type FormCheckboxProps<TFieldValues extends FieldValues> = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name' | 'type'
> & {
  name: FieldPath<TFieldValues>
  label: string
}

export function FormCheckbox<TFieldValues extends FieldValues>({
  name,
  label,
  className,
  id: idProp,
  ...props
}: FormCheckboxProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>()

  const error = errors[name]?.message as string | undefined
  const { id, errorId } = useFieldIds({ id: idProp, error })

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="inline-flex w-fit cursor-pointer items-center gap-2.5"
      >
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            'checkbox checkbox-sm checkbox-primary shrink-0 rounded-md border-base-content/45 bg-transparent text-primary-content checked:border-primary checked:bg-primary [[data-theme$=light]_&]:border-base-content/70 [[data-theme$=light]_&]:bg-base-100 [[data-theme$=light]_&]:checked:bg-primary',
            className,
          )}
          {...props}
          {...register(name)}
        />
        <span className="text-sm text-base-content/80">{label}</span>
      </label>
      {error ? (
        <p id={errorId} className="text-xs text-error/80" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
