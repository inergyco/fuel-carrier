import type { InputHTMLAttributes } from 'react'
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { Input } from './Input'

type FormInputProps<TFieldValues extends FieldValues> = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name'
> & {
  name: FieldPath<TFieldValues>
  label?: string
}

export function FormInput<TFieldValues extends FieldValues>({
  name,
  label,
  className,
  ...props
}: FormInputProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>()

  const error = errors[name]?.message as string | undefined

  return (
    <Input
      label={label}
      error={error}
      className={className}
      {...props}
      {...register(name)}
    />
  )
}
