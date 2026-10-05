import { useI18nContext } from '@fuel-carrier/i18n/react'
import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'

export function AppearanceSettings() {
  const { LL } = useI18nContext()

  return (
    <section className="rounded-2xl border border-base-content/8 bg-base-200/40 px-3 py-1 backdrop-blur-xl sm:px-5 sm:py-2">
      <ul className="divide-y divide-base-content/8">
        <li className="flex items-center justify-between gap-3 py-2.5 sm:py-3.5">
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-tight">
              {LL.common.appearance.language()}
            </p>
            <p className="mt-0.5 text-xs text-base-content/50">
              {LL.common.appearance.languageHint()}
            </p>
          </div>
          <LanguageToggle />
        </li>
        <li className="flex items-center justify-between gap-3 py-2.5 sm:py-3.5">
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-tight">
              {LL.common.appearance.theme()}
            </p>
            <p className="mt-0.5 text-xs text-base-content/50">
              {LL.common.appearance.themeHint()}
            </p>
          </div>
          <ThemeToggle />
        </li>
      </ul>
    </section>
  )
}
