import type { TextareaHTMLAttributes } from 'react'
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { Textarea } from './Textarea'

type FormTextareaProps<TFieldValues extends FieldValues> = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'name'
> & {
  name: FieldPath<TFieldValues>
  label?: string
}

export function FormTextarea<TFieldValues extends FieldValues>({
  name,
  label,
  className,
  ...props
}: FormTextareaProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>()

  const error = errors[name]?.message as string | undefined

  return (
    <Textarea
      label={label}
      error={error}
      className={className}
      {...props}
      {...register(name)}
    />
  )
}
