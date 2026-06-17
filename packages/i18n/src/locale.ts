import type { Locales } from './i18n/i18n-types.js'

export const LOCALE_STORAGE_KEY = 'locale'

export const DEFAULT_LOCALE: Locales = 'fa'

export const locales = ['en', 'fa'] as const satisfies readonly Locales[]

export function isLocale(value: string): value is Locales {
  return locales.includes(value as Locales)
}

export function detectLocale(): Locales {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored && isLocale(stored)) {
    return stored
  }

  const browserLocale = navigator.language.toLowerCase()
  if (browserLocale.startsWith('en')) {
    return 'en'
  }

  return DEFAULT_LOCALE
}

export function getDirection(locale: Locales): 'ltr' | 'rtl' {
  return locale === 'fa' ? 'rtl' : 'ltr'
}

export function applyDocumentLocale(locale: Locales): void {
  document.documentElement.lang = locale
  document.documentElement.dir = getDirection(locale)
}
