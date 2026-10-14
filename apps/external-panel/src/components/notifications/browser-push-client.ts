import type {
  DeletePushSubscriptionDto,
  PushVapidPublicKey,
  SavePushSubscriptionDto,
} from '@fuel-carrier/shared-types/notification'
import { api } from '@fuel-carrier/web-ui/api'
import { OPEN_NOTIFICATIONS_PARAM } from './browser-push'

export async function syncBrowserPushSubscription(): Promise<void> {
  const registration = await readyRegistration()
  if (!registration) {
    return
  }

  const { publicKey } = await api
    .get('notifications/push/vapid-public-key')
    .json<PushVapidPublicKey>()
  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
  }

  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    return
  }

  const body: SavePushSubscriptionDto = {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  }
  await api.put('notifications/push/subscription', { json: body }).json()
}

export async function removeBrowserPushSubscription(): Promise<void> {
  const registration = await readyRegistration(1_500)
  if (!registration) {
    return
  }

  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    return
  }

  const body: DeletePushSubscriptionDto = { endpoint: subscription.endpoint }
  try {
    await api.post('notifications/push/subscription/remove', { json: body }).json()
  } finally {
    await subscription.unsubscribe()
  }
}

export function readOpenNotificationsParam(): boolean {
  return (
    new URLSearchParams(window.location.search).get(OPEN_NOTIFICATIONS_PARAM) ===
    '1'
  )
}

export function clearOpenNotificationsParam(): void {
  const params = new URLSearchParams(window.location.search)
  if (!params.has(OPEN_NOTIFICATIONS_PARAM)) {
    return
  }

  params.delete(OPEN_NOTIFICATIONS_PARAM)
  const next = params.toString()
  const path = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', path)
}

function readyRegistration(
  timeoutMs?: number,
): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return Promise.resolve(null)
  }

  if (timeoutMs == null) {
    return navigator.serviceWorker.ready
  }

  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), timeoutMs)
    }),
  ])
}

function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index)
  }
  return output
}
