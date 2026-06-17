import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Moon, Sun } from 'lucide-react'
import { Button } from './Button'
import { useTheme } from './useTheme'

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
        <Sun className="h-[18px] w-[18px]" aria-hidden />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden />
      )}
    </Button>
  )
}
