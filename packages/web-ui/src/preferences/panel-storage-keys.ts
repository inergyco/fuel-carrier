export type PanelId = 'internal' | 'external'

export type PanelStorageKeys = {
  theme: string
  locale: string
}

export function getPanelStorageKeys(panelId: PanelId): PanelStorageKeys {
  return {
    theme: `fuel-carrier:${panelId}-panel:theme`,
    locale: `fuel-carrier:${panelId}-panel:locale`,
  }
}
