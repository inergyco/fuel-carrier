import type { InputHTMLAttributes } from 'react'
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { Checkbox } from './Checkbox'
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
        <Checkbox
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={className}
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
