import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Button } from './Button'

export function LanguageToggle() {
  const { locale, setLocale, LL } = useI18nContext()

  function toggleLocale() {
    setLocale(locale === 'en' ? 'fa' : 'en')
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={toggleLocale}
      aria-label={locale === 'en' ? LL.common.switchToPersian() : LL.common.switchToEnglish()}
    >
      {locale === 'en' ? LL.common.languageFa() : LL.common.languageEn()}
    </Button>
  )
}
