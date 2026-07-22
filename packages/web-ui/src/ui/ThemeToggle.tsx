import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Moon, Sun } from '@fuel-carrier/web-ui/icons'
import { ICON_STROKE_WIDTH, iconMdClassName } from './iconClassName'
import { Button } from './Button'
import { useTheme } from './theme-context'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { LL } = useI18nContext()

  return (
    <Button
      type="button"
      variant="icon"
      onClick={toggle}
      aria-label={
        theme === 'dark' ? LL.common.switchToLightMode() : LL.common.switchToDarkMode()
      }
    >
      {theme === 'dark' ? (
        <Sun className={iconMdClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
      ) : (
        <Moon className={iconMdClassName} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
      )}
    </Button>
  )
}
