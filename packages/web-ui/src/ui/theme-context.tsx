import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'

export type ThemeMode = 'light' | 'dark'

export type ThemeNames = Record<ThemeMode, string>

export const defaultThemeNames: ThemeNames = {
  light: 'light',
  dark: 'dark',
}

export const defaultThemeStorageKey = 'theme'

type ThemeContextValue = {
  names: ThemeNames
  storageKey: string
}

const defaultThemeContextValue: ThemeContextValue = {
  names: defaultThemeNames,
  storageKey: defaultThemeStorageKey,
}

const ThemeContext = createContext<ThemeContextValue>(defaultThemeContextValue)

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function readStoredThemeMode(storageKey: string): ThemeMode | null {
  const stored = localStorage.getItem(storageKey)
  if (isThemeMode(stored)) {
    return stored
  }

  return null
}

export function resolveThemeMode(
  themeNames: ThemeNames,
  storageKey: string,
): ThemeMode {
  const stored = readStoredThemeMode(storageKey)
  if (stored) {
    return stored
  }

  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === themeNames.dark) return 'dark'
  if (attr === themeNames.light) return 'light'
  if (attr === defaultThemeNames.dark) return 'dark'
  if (attr === defaultThemeNames.light) return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function applyThemeMode(themeNames: ThemeNames, mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', themeNames[mode])
}

export function persistThemeMode(storageKey: string, mode: ThemeMode) {
  localStorage.setItem(storageKey, mode)
}

type ThemeProviderProps = {
  themeNames?: Partial<ThemeNames>
  storageKey?: string
  children: ReactNode
}

export function ThemeProvider({
  themeNames,
  storageKey = defaultThemeStorageKey,
  children,
}: ThemeProviderProps) {
  const lightThemeName = themeNames?.light
  const darkThemeName = themeNames?.dark
  const value = useMemo(
    function createThemeContextValue(): ThemeContextValue {
      return {
        names: {
          light: lightThemeName ?? defaultThemeNames.light,
          dark: darkThemeName ?? defaultThemeNames.dark,
        },
        storageKey,
      }
    },
    [lightThemeName, darkThemeName, storageKey],
  )

  useEffect(
    function syncThemeOnMount() {
      const mode = resolveThemeMode(value.names, value.storageKey)
      applyThemeMode(value.names, mode)
      persistThemeMode(value.storageKey, mode)
    },
    [value],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeConfig(): ThemeContextValue {
  return useContext(ThemeContext)
}

export function useThemeNames(): ThemeNames {
  return useThemeConfig().names
}
