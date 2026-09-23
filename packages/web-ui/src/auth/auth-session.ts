export const AUTH_ME_QUERY_KEY = ['auth', 'me'] as const

export type AuthSessionMessage = {
  type: 'logout'
}

function authSessionChannelName(panelId: string): string {
  return `fuel-carrier:${panelId}-panel:auth-session`
}

export function broadcastAuthLogout(panelId: string): void {
  if (typeof BroadcastChannel === 'undefined') {
    return
  }

  const channel = new BroadcastChannel(authSessionChannelName(panelId))
  const message: AuthSessionMessage = { type: 'logout' }
  channel.postMessage(message)
  channel.close()
}

export function subscribeAuthSessionMessages(
  panelId: string,
  onMessage: (message: AuthSessionMessage) => void,
): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return () => {}
  }

  const channel = new BroadcastChannel(authSessionChannelName(panelId))

  function handleMessage(event: MessageEvent<AuthSessionMessage>) {
    if (event.data?.type === 'logout') {
      onMessage(event.data)
    }
  }

  channel.addEventListener('message', handleMessage)

  return function unsubscribeAuthSessionMessages() {
    channel.removeEventListener('message', handleMessage)
    channel.close()
  }
}
