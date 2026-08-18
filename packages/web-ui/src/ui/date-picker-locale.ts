import type { Locales } from '@fuel-carrier/i18n';
import type { Calendar, Locale } from 'react-date-object';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import gregorianEn from 'react-date-object/locales/gregorian_en';
import persianFa from 'react-date-object/locales/persian_fa';

type DatePickerLocale = {
  calendar: Calendar;
  locale: Locale;
  calendarPosition: 'bottom-start' | 'bottom-end';
};

export function getDatePickerLocale(appLocale: Locales): DatePickerLocale {
  if (appLocale === 'fa') {
    return {
      calendar: persian,
      locale: persianFa,
      calendarPosition: 'bottom-end',
    };
  }

  return {
    calendar: gregorian,
    locale: gregorianEn,
    calendarPosition: 'bottom-start',
  };
}
