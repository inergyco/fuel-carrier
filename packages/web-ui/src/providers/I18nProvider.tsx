import { useEffect } from 'react'
import TypesafeI18n, { useI18nContext } from '@fuel-carrier/i18n/react'
import {
  applyDocumentLocale,
  detectLocale,
  loadAllLocales,
  LOCALE_STORAGE_KEY,
} from '@fuel-carrier/i18n'

loadAllLocales()

type I18nProviderProps = {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  return (
    <TypesafeI18n locale={detectLocale()}>
      <LocaleSync />
      {children}
    </TypesafeI18n>
  )
}

function LocaleSync() {
  const { locale } = useI18nContext()

  useEffect(function syncDocumentLocale() {
    applyDocumentLocale(locale)
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  return null
}
