import { useState } from 'react'
import {
  applyThemeMode,
  persistThemeMode,
  resolveThemeMode,
  type ThemeMode,
  useThemeConfig,
} from './theme-context'

export type Theme = ThemeMode

export function useTheme() {
  const { names: themeNames, storageKey } = useThemeConfig()
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    resolveThemeMode(themeNames, storageKey),
  )

  function setTheme(next: ThemeMode) {
    applyThemeMode(themeNames, next)
    persistThemeMode(storageKey, next)
    setThemeState(next)
  }

  function toggle() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return { theme, setTheme, toggle }
}
