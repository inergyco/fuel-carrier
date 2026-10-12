import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent } from 'react'
import { toDigitsOnly } from '@fuel-carrier/shared-validation/national-id'
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
  /** Keep Latin digits only. Persian and Arabic-Indic digits are converted. */
  digitsOnly?: boolean
}

export function FormInput<TFieldValues extends FieldValues>({
  name,
  label,
  className,
  digitsOnly = false,
  onChange,
  onKeyDown,
  dir,
  inputMode,
  ...props
}: FormInputProps<TFieldValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>()

  const error = errors[name]?.message as string | undefined
  const registration = register(name)

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (
      digitsOnly &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      event.key.length === 1 &&
      toDigitsOnly(event.key).length === 0
    ) {
      event.preventDefault()
    }

    onKeyDown?.(event)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (digitsOnly) {
      const digits = toDigitsOnly(event.target.value)

      if (event.target.value !== digits) {
        event.target.value = digits
      }
    }

    void registration.onChange(event)
    onChange?.(event)
  }

  return (
    <Input
      label={label}
      error={error}
      className={className}
      inputMode={digitsOnly ? 'numeric' : inputMode}
      dir={digitsOnly ? 'ltr' : dir}
      {...props}
      {...registration}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
    />
  )
}
