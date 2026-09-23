import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  AUTH_ME_QUERY_KEY,
  subscribeAuthSessionMessages,
} from '../auth/auth-session'
import type { PanelId } from '../preferences/panel-storage-keys'
import { redirectToLoginPage } from '../utils/redirect'

type AuthSessionSyncProps = {
  panelId: PanelId
}

/**
 * Cross-tab logout sync + refetch `me` when the window regains focus.
 */
export function AuthSessionSync({ panelId }: AuthSessionSyncProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = subscribeAuthSessionMessages(panelId, () => {
      queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY })
      redirectToLoginPage(window.location.href)
    })

    function handleWindowFocus() {
      void queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY })
    }

    window.addEventListener('focus', handleWindowFocus)

    return () => {
      unsubscribe()
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [panelId, queryClient])

  return null
}
