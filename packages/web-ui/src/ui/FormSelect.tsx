import type { ReactNode, SelectHTMLAttributes } from 'react'
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { Select } from './Select'

type FormSelectProps<TFieldValues extends FieldValues> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'name'
> & {
  name: FieldPath<TFieldValues>
  label?: string
  children: ReactNode
}

export function FormSelect<TFieldValues extends FieldValues>({
  name,
  label,
  className,
  children,
  ...props
}: FormSelectProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>()

  const error = errors[name]?.message as string | undefined

  return (
    <Select
      label={label}
      error={error}
      className={className}
      {...props}
      {...register(name)}
    >
      {children}
    </Select>
  )
}
