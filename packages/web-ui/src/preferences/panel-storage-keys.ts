export type PanelId = 'internal' | 'external'

export type PanelStorageKeys = {
  theme: string
  locale: string
  dashboardMode: string
}

export function getPanelStorageKeys(panelId: PanelId): PanelStorageKeys {
  return {
    theme: `fuel-carrier:${panelId}-panel:theme`,
    locale: `fuel-carrier:${panelId}-panel:locale`,
    dashboardMode: `fuel-carrier:${panelId}-panel:dashboard-mode`,
  }
}
