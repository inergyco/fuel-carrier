import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setApiUnauthorizedHandler } from '@fuel-carrier/web-ui/api'
import { broadcastAuthLogout } from '@fuel-carrier/web-ui/auth'
import {
  AppProviders,
  getPanelStorageKeys,
  ThemeProvider,
} from '@fuel-carrier/web-ui/providers'
import { redirectToLoginPage } from '@fuel-carrier/web-ui/utils'
import './index.css'
import './routeTree.gen'
import { router } from './router'

const panelId = 'internal' as const
const storageKeys = getPanelStorageKeys(panelId)

setApiUnauthorizedHandler(() => {
  broadcastAuthLogout(panelId)
  redirectToLoginPage(window.location.href)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      themeNames={{ light: 'internal-light', dark: 'internal-dark' }}
      storageKey={storageKeys.theme}
    >
      <AppProviders
        router={router}
        localeStorageKey={storageKeys.locale}
        panelId={panelId}
      />
    </ThemeProvider>
  </StrictMode>,
)
