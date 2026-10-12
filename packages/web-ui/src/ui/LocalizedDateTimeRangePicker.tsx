import { useI18nContext } from '@fuel-carrier/i18n/react'
import type { ReactNode } from 'react'
import type DateObject from 'react-date-object'
import datePickerModule from 'react-multi-date-picker'
import timePickerModule from 'react-multi-date-picker/plugins/time_picker'
import { X } from '../icons'
import { cn } from '../utils'
import { getDatePickerLocale } from './date-picker-locale'
import { Field } from './Field'
import { ICON_STROKE_WIDTH, iconSmClassName } from './iconClassName'
import { useFieldIds } from './useFieldIds'
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
  id: idProp,
}: LocalizedDateTimeRangePickerProps) {
  const { LL, locale } = useI18nContext()
  const datePickerLocale = getDatePickerLocale(locale)
  const { id, errorId } = useFieldIds({ id: idProp, error })
  const hasValue = value.start != null || value.end != null

  function handleChange(nextValue: DateObject | DateObject[] | null) {
    onChange(toDateTimeRangeValue(nextValue))
  }

  function handleClear() {
    onChange({ start: null, end: null })
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
      <div className="relative min-w-0">
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
          inputClass={cn(
            'localized-date-time-picker-input',
            hasValue && !disabled && 'localized-date-time-picker-input--clearable',
          )}
          arrow={false}
          shadow={false}
          plugins={[<TimePicker position="bottom" hideSeconds />]}
        />
        {hasValue && !disabled ? (
          <button
            type="button"
            aria-label={LL.common.dateRange.clear()}
            onClick={handleClear}
            className="absolute end-1 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-base-content/45 transition-colors hover:bg-base-content/5 hover:text-base-content/70"
          >
            <X
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
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
