import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { LicensePlatePicker } from './license-plate-picker'

type FormLicensePlatePickerProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>
  label?: string
  disabled?: boolean
  className?: string
}

export function FormLicensePlatePicker<TFieldValues extends FieldValues>({
  name,
  label,
  disabled,
  className,
}: FormLicensePlatePickerProps<TFieldValues>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<TFieldValues>()

  const error = errors[name]?.message as string | undefined

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <LicensePlatePicker
          name={field.name}
          label={label}
          error={error}
          value={typeof field.value === 'string' ? field.value : ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          className={className}
        />
      )}
    />
  )
}
