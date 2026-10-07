import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getPanelStorageKeys,
  type PanelId,
} from '../preferences/panel-storage-keys'
import {
  readStoredDashboardMode,
  writeStoredDashboardMode,
  type DashboardMode,
} from './dashboard-mode'

type DashboardModeContextValue = {
  mode: DashboardMode
  setMode: (mode: DashboardMode) => void
}

const DashboardModeContext = createContext<DashboardModeContextValue | null>(
  null,
)

type DashboardModeProviderProps = {
  panelId: PanelId
  children: ReactNode
}

export function DashboardModeProvider({
  panelId,
  children,
}: DashboardModeProviderProps) {
  const storageKey = getPanelStorageKeys(panelId).dashboardMode
  const [mode, setModeState] = useState<DashboardMode>(() =>
    readStoredDashboardMode(storageKey),
  )

  const setMode = useCallback(
    function setMode(nextMode: DashboardMode) {
      setModeState(nextMode)
      writeStoredDashboardMode(storageKey, nextMode)
    },
    [storageKey],
  )

  const value = useMemo<DashboardModeContextValue>(
    () => ({ mode, setMode }),
    [mode, setMode],
  )

  return (
    <DashboardModeContext.Provider value={value}>
      {children}
    </DashboardModeContext.Provider>
  )
}

export function useDashboardMode(): DashboardModeContextValue {
  const value = useContext(DashboardModeContext)
  if (!value) {
    throw new Error(
      'useDashboardMode must be used within DashboardModeProvider',
    )
  }

  return value
}
