import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { ReactNode } from 'react'
import type DateObject from 'react-date-object'
import datePickerModule from 'react-multi-date-picker'
import timePickerModule from 'react-multi-date-picker/plugins/time_picker'
import { cn } from '../utils'
import { getDatePickerLocale } from './date-picker-locale'
import { Field } from './Field'
import { useFieldIds } from './useFieldIds'
import './localized-date-time-picker.css'

const DatePicker = cjsExport(datePickerModule)
const TimePicker = cjsExport(timePickerModule)

type LocalizedDateTimePickerProps = {
  label?: string
  error?: string
  value: Date | null
  onChange: (value: Date | null) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  compact?: boolean
  className?: string
  id?: string
}

export function LocalizedDateTimePicker({
  label,
  error,
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
  disabled = false,
  compact = false,
  className,
  id: idProp,
}: LocalizedDateTimePickerProps) {
  const { locale } = useI18nContext()
  const datePickerLocale = getDatePickerLocale(locale)
  const { id, errorId } = useFieldIds({ id: idProp, error })

  function handleChange(nextValue: DateObject | null) {
    onChange(nextValue ? nextValue.toDate() : null)
  }

  return (
    <DateTimePickerChrome
      label={label}
      error={error}
      htmlFor={id}
      errorId={errorId}
      compact={compact}
      className={className}
    >
      <DatePicker
        id={id}
        value={value}
        onChange={handleChange}
        calendar={datePickerLocale.calendar}
        locale={datePickerLocale.locale}
        format="YYYY-MM-DD HH:mm"
        monthYearSeparator=" / "
        minDate={minDate}
        maxDate={capMaxDate(maxDate)}
        placeholder={placeholder}
        disabled={disabled}
        editable={false}
        calendarPosition={datePickerLocale.calendarPosition}
        containerClassName="localized-date-time-picker-container"
        inputClass="localized-date-time-picker-input"
        arrow={false}
        shadow={false}
        plugins={[<TimePicker position="bottom" hideSeconds />]}
      />
    </DateTimePickerChrome>
  )
}

type DateTimePickerChromeProps = {
  label?: string
  error?: string
  htmlFor?: string
  errorId?: string
  compact: boolean
  className?: string
  children: ReactNode
}

function DateTimePickerChrome({
  label,
  error,
  htmlFor,
  errorId,
  compact,
  className,
  children,
}: DateTimePickerChromeProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-1.5',
          className,
        )}
      >
        {label ? (
          <label
            htmlFor={htmlFor}
            className="shrink-0 text-[11px] font-medium text-base-content/45"
          >
            {label}
          </label>
        ) : null}
        <div className="min-w-0 flex-1">{children}</div>
        {error ? (
          <p id={errorId} className="text-xs text-error/80" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <Field label={label} error={error} htmlFor={htmlFor} errorId={errorId}>
      {children}
    </Field>
  )
}

function capMaxDate(maxDate?: Date): Date {
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  if (maxDate == null || maxDate.getTime() > endOfToday.getTime()) {
    return endOfToday
  }

  return maxDate
}

function cjsExport<T>(mod: T): T {
  if (mod != null && typeof mod === 'object' && 'default' in mod) {
    const inner = (mod as { default: T }).default
    if (inner != null) {
      return inner
    }
  }

  return mod
}
