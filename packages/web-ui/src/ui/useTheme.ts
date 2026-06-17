import { useState } from 'react'

export type Theme = 'light' | 'dark'

function resolveInitialTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme)

  function setTheme(next: Theme) {
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setThemeState(next)
  }

  function toggle() {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return { theme, setTheme, toggle }
}
