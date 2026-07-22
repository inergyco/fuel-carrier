import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'light' | 'dark'

export type ThemeNames = Record<ThemeMode, string>

type ThemeContextValue = {
  theme: ThemeMode
  setTheme: (mode: ThemeMode) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function resolveThemeMode(names: ThemeNames, storageKey: string): ThemeMode {
  const stored = localStorage.getItem(storageKey)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === names.dark || attr === 'dark') return 'dark'
  if (attr === names.light || attr === 'light') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

type ThemeProviderProps = {
  themeNames?: Partial<ThemeNames>
  storageKey?: string
  children: ReactNode
}

export function ThemeProvider({
  themeNames,
  storageKey = 'theme',
  children,
}: ThemeProviderProps) {
  const names = useMemo(
    function createThemeNames(): ThemeNames {
      return {
        light: themeNames?.light ?? 'light',
        dark: themeNames?.dark ?? 'dark',
      }
    },
    [themeNames?.light, themeNames?.dark],
  )

  const [theme, setThemeState] = useState<ThemeMode>(() =>
    resolveThemeMode(names, storageKey),
  )

  const setTheme = useCallback(
    function setTheme(mode: ThemeMode) {
      document.documentElement.setAttribute('data-theme', names[mode])
      localStorage.setItem(storageKey, mode)
      setThemeState(mode)
    },
    [names, storageKey],
  )

  const toggle = useCallback(
    function toggle() {
      setTheme(theme === 'light' ? 'dark' : 'light')
    },
    [setTheme, theme],
  )

  useEffect(
    function syncTheme() {
      setTheme(resolveThemeMode(names, storageKey))
    },
    [names, setTheme, storageKey],
  )

  const value = useMemo(
    function createThemeContextValue(): ThemeContextValue {
      return { theme, setTheme, toggle }
    },
    [setTheme, theme, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (!value) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return value
}
