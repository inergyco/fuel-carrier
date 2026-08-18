import { useI18nContext } from '@fuel-carrier/i18n/react';
import type DateObject from 'react-date-object';
import datePickerModule from 'react-multi-date-picker';
import timePickerModule from 'react-multi-date-picker/plugins/time_picker';
import { cn } from '../utils';
import { getDatePickerLocale } from './date-picker-locale';
import { Field } from './Field';
import './localized-date-time-picker.css';

const DatePicker = cjsExport(datePickerModule);
const TimePicker = cjsExport(timePickerModule);

type LocalizedDateTimePickerProps = {
  label?: string;
  error?: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  id?: string;
};

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
  id,
}: LocalizedDateTimePickerProps) {
  const { locale } = useI18nContext();
  const datePickerLocale = getDatePickerLocale(locale);

  function handleChange(nextValue: DateObject | null) {
    onChange(nextValue ? nextValue.toDate() : null);
  }

  const latestAllowedDate = capMaxDate(maxDate);

  const datePicker = (
    <DatePicker
      id={id}
      value={value}
      onChange={handleChange}
      calendar={datePickerLocale.calendar}
      locale={datePickerLocale.locale}
      format="YYYY-MM-DD HH:mm"
      monthYearSeparator=" / "
      minDate={minDate}
      maxDate={latestAllowedDate}
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
  );

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
        <div className="min-w-0 flex-1">{datePicker}</div>
        {error ? <p className="text-xs text-error/80">{error}</p> : null}
      </div>
    );
  }

  return (
    <Field label={label} error={error}>
      {datePicker}
    </Field>
  );
}

function capMaxDate(maxDate?: Date): Date {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (maxDate == null || maxDate.getTime() > endOfToday.getTime()) {
    return endOfToday;
  }

  return maxDate;
}

function cjsExport<T>(mod: T): T {
  if (mod != null && typeof mod === 'object' && 'default' in mod) {
    const inner = (mod as { default: T }).default;
    if (inner != null) {
      return inner;
    }
  }

  return mod;
}
