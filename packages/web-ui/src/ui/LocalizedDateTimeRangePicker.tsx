import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { ReactNode } from 'react'
import type DateObject from 'react-date-object'
import datePickerModule from 'react-multi-date-picker'
import timePickerModule from 'react-multi-date-picker/plugins/time_picker'
import { cn } from '../utils'
import { getDatePickerLocale } from './date-picker-locale'
import { Field } from './Field'
import './localized-date-time-picker.css'

const DatePicker = cjsExport(datePickerModule)
const TimePicker = cjsExport(timePickerModule)

export type DateTimeRangeValue = {
  start: Date | null
  end: Date | null
}

type LocalizedDateTimeRangePickerProps = {
  label?: string
  error?: string
  value: DateTimeRangeValue
  onChange: (value: DateTimeRangeValue) => void
  placeholder?: string
  maxDate?: Date
  disabled?: boolean
  compact?: boolean
  className?: string
  id?: string
}

export function LocalizedDateTimeRangePicker({
  label,
  error,
  value,
  onChange,
  placeholder,
  maxDate,
  disabled = false,
  compact = false,
  className,
  id,
}: LocalizedDateTimeRangePickerProps) {
  const { locale } = useI18nContext()
  const datePickerLocale = getDatePickerLocale(locale)

  function handleChange(nextValue: DateObject | DateObject[] | null) {
    onChange(toDateTimeRangeValue(nextValue))
  }

  return (
    <DateTimePickerChrome
      label={label}
      error={error}
      compact={compact}
      className={className}
    >
      <DatePicker
        id={id}
        range
        rangeHover
        value={toPickerRangeValue(value)}
        onChange={handleChange}
        calendar={datePickerLocale.calendar}
        locale={datePickerLocale.locale}
        format="YYYY-MM-DD HH:mm"
        dateSeparator=" – "
        monthYearSeparator=" / "
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
  compact: boolean
  className?: string
  children: ReactNode
}

function DateTimePickerChrome({
  label,
  error,
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
          <span className="shrink-0 text-[11px] font-medium text-base-content/45">
            {label}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">{children}</div>
        {error ? <p className="text-xs text-error/80">{error}</p> : null}
      </div>
    )
  }

  return (
    <Field label={label} error={error}>
      {children}
    </Field>
  )
}

function toPickerRangeValue(value: DateTimeRangeValue): Date[] | undefined {
  if (value.start && value.end) {
    return [value.start, value.end]
  }

  if (value.start) {
    return [value.start]
  }

  return undefined
}

function toDateTimeRangeValue(
  nextValue: DateObject | DateObject[] | null,
): DateTimeRangeValue {
  if (nextValue == null) {
    return { start: null, end: null }
  }

  if (Array.isArray(nextValue)) {
    return {
      start: nextValue[0]?.toDate() ?? null,
      end: nextValue[1]?.toDate() ?? null,
    }
  }

  return { start: nextValue.toDate(), end: null }
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
