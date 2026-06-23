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
  localeStorageKey?: string
  children: React.ReactNode
}

export function I18nProvider({
  localeStorageKey = LOCALE_STORAGE_KEY,
  children,
}: I18nProviderProps) {
  return (
    <TypesafeI18n locale={detectLocale(localeStorageKey)}>
      <LocaleSync localeStorageKey={localeStorageKey} />
      {children}
    </TypesafeI18n>
  )
}

type LocaleSyncProps = {
  localeStorageKey: string
}

function LocaleSync({ localeStorageKey }: LocaleSyncProps) {
  const { locale } = useI18nContext()

  useEffect(
    function syncDocumentLocale() {
      applyDocumentLocale(locale)
      localStorage.setItem(localeStorageKey, locale)
    },
    [locale, localeStorageKey],
  )

  return null
}
