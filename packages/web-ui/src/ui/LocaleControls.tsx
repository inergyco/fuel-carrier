import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Languages, Moon, Settings, Sun } from '../icons'
import { cn } from '../utils'
import { ContextMenu, ContextMenuItem } from './ContextMenu'
import { ICON_STROKE_WIDTH, iconSmClassName } from './IconButton'
import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from './theme-context'

interface LocaleControlsProps {
  className?: string
}

export function LocaleControls({ className }: LocaleControlsProps) {
  const { locale, setLocale, LL } = useI18nContext()
  const { theme, toggle } = useTheme()
  const languageLabel =
    locale === 'en' ? LL.common.switchToPersian() : LL.common.switchToEnglish()
  const themeLabel =
    theme === 'dark'
      ? LL.common.switchToLightMode()
      : LL.common.switchToDarkMode()
  const ThemeIcon = theme === 'dark' ? Sun : Moon

  function toggleLocale() {
    setLocale(locale === 'en' ? 'fa' : 'en')
  }

  return (
    <div
      className={cn(
        'absolute top-4 end-4 z-20 flex items-center gap-1',
        className,
      )}
    >
      <div className="hidden items-center gap-1 md:flex">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <ContextMenu
        label={LL.common.appearance.open()}
        className="md:hidden"
        panelClassName="w-[min(16rem,calc(100vw-2rem))]"
        icon={
          <Settings
            className={iconSmClassName}
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden
          />
        }
      >
        <ContextMenuItem
          icon={
            <Languages
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
          }
          onClick={toggleLocale}
        >
          {languageLabel}
        </ContextMenuItem>
        <ContextMenuItem
          icon={
            <ThemeIcon
              className={iconSmClassName}
              strokeWidth={ICON_STROKE_WIDTH}
              aria-hidden
            />
          }
          onClick={toggle}
        >
          {themeLabel}
        </ContextMenuItem>
      </ContextMenu>
    </div>
  )
}
