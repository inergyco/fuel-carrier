/**
 * Loaded by vite-plugin-pwa via workbox.importScripts.
 * Keep message / query names aligned with src/components/notifications/browser-push.ts.
 */
const NOTIFICATION_CLICK_MESSAGE = 'fuel-carrier:notification-click'
const OPEN_NOTIFICATIONS_PARAM = 'openNotifications'

self.addEventListener('push', function onPush(event) {
  const payload = readPushPayload(event)
  if (!payload) {
    return
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: '/pwa-192x192.png',
    }),
  )
})

self.addEventListener('notificationclick', function onNotificationClick(event) {
  event.notification.close()
  event.waitUntil(focusCompanyApp())
})

function readPushPayload(event) {
  if (!event.data) {
    return null
  }

  try {
    const payload = event.data.json()
    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof payload.title !== 'string' ||
      payload.title.length === 0 ||
      typeof payload.body !== 'string' ||
      typeof payload.tag !== 'string'
    ) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

async function focusCompanyApp() {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  })
  const existing = clients.find(function matchesOrigin(client) {
    return client.url.startsWith(self.location.origin)
  })
  if (existing) {
    existing.postMessage({ type: NOTIFICATION_CLICK_MESSAGE })
    await existing.focus()
    return
  }

  const url = new URL('/', self.location.origin)
  url.searchParams.set(OPEN_NOTIFICATIONS_PARAM, '1')
  await self.clients.openWindow(url.href)
}
