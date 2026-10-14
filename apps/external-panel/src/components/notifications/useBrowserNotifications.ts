import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { isNotificationClickMessage } from './browser-push'
import {
  clearOpenNotificationsParam,
  readOpenNotificationsParam,
  syncBrowserPushSubscription,
} from './browser-push-client'

export type BrowserPermission = NotificationPermission | 'unsupported'

type BrowserNotificationOptions = {
  setOpen: Dispatch<SetStateAction<boolean>>
}

export function useBrowserNotifications({
  setOpen,
}: BrowserNotificationOptions) {
  const [permission, setPermission] = useState(readBrowserPermission)

  useEffect(function openInboxFromPush() {
    if (readOpenNotificationsParam()) {
      setOpen(true)
      clearOpenNotificationsParam()
    }

    if (!('serviceWorker' in navigator)) {
      return
    }

    function onMessage(event: MessageEvent) {
      if (isNotificationClickMessage(event.data)) {
        setOpen(true)
      }
    }

    navigator.serviceWorker.addEventListener('message', onMessage)
    return function stopListening() {
      navigator.serviceWorker.removeEventListener('message', onMessage)
    }
  }, [setOpen])

  useEffect(function subscribeWhenAllowed() {
    if (permission !== 'granted') {
      return
    }

    void syncBrowserPushSubscription().catch(() => undefined)
  }, [permission])

  async function requestPermission() {
    if (!canRequestPushPermission()) {
      return
    }

    const next = await Notification.requestPermission()
    setPermission(next)
  }

  return { permission, requestPermission }
}

function readBrowserPermission(): BrowserPermission {
  if (!canRequestPushPermission()) {
    return 'unsupported'
  }

  return Notification.permission
}

function canRequestPushPermission(): boolean {
  return (
    typeof Notification !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}
