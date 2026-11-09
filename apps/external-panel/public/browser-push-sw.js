/**
 * Loaded by vite-plugin-pwa via workbox.importScripts.
 * Keep message / query names aligned with src/components/notifications/browser-push.ts.
 * Locale message matches LOCALE_SYNC_MESSAGE in packages/i18n/src/locale.ts.
 * English patterns and Persian copy match localize-car-alert.ts and the fa catalog.
 */
const NOTIFICATION_CLICK_MESSAGE = 'fuel-carrier:notification-click'
const OPEN_NOTIFICATIONS_PARAM = 'openNotifications'
const LOCALE_MESSAGE = 'fuel-carrier:locale'
const LOCALE_DB_NAME = 'fuel-carrier-push'
const LOCALE_STORE = 'meta'
const LOCALE_KEY = 'locale'
const DEFAULT_PUSH_LOCALE = 'fa'

let rememberedLocale = null

self.addEventListener('push', function onPush(event) {
  const payload = readPushPayload(event)
  if (!payload) {
    return
  }

  event.waitUntil(
    readLocale().then(function showLocalized(locale) {
      const copy =
        locale === 'fa' ? localizeFaAlert(payload.title, payload.body) : null
      return self.registration.showNotification(copy?.title ?? payload.title, {
        body: copy?.body ?? payload.body,
        tag: payload.tag,
        icon: '/pwa-192x192.png',
      })
    }),
  )
})

self.addEventListener('notificationclick', function onNotificationClick(event) {
  event.notification.close()
  event.waitUntil(focusCompanyApp())
})

self.addEventListener('message', function onLocaleMessage(event) {
  const locale = readLocaleMessage(event.data)
  if (!locale) {
    return
  }

  rememberedLocale = locale
  void storeLocale(locale)
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

function readLocaleMessage(data) {
  if (typeof data !== 'object' || data === null || data.type !== LOCALE_MESSAGE) {
    return null
  }

  return data.locale === 'fa' || data.locale === 'en' ? data.locale : null
}

function readLocale() {
  if (rememberedLocale) {
    return Promise.resolve(rememberedLocale)
  }

  return readStoredLocale().then(function remember(locale) {
    rememberedLocale = locale
    return locale
  })
}

function readStoredLocale() {
  return openLocaleDb()
    .then(function (db) {
      return new Promise(function (resolve) {
        const request = db
          .transaction(LOCALE_STORE, 'readonly')
          .objectStore(LOCALE_STORE)
          .get(LOCALE_KEY)
        request.onsuccess = function () {
          resolve(request.result === 'en' ? 'en' : DEFAULT_PUSH_LOCALE)
        }
        request.onerror = function () {
          resolve(DEFAULT_PUSH_LOCALE)
        }
      })
    })
    .catch(function () {
      return DEFAULT_PUSH_LOCALE
    })
}

function storeLocale(locale) {
  return openLocaleDb()
    .then(function (db) {
      return new Promise(function (resolve) {
        const request = db
          .transaction(LOCALE_STORE, 'readwrite')
          .objectStore(LOCALE_STORE)
          .put(locale, LOCALE_KEY)
        request.onsuccess = function () {
          resolve()
        }
        request.onerror = function () {
          resolve()
        }
      })
    })
    .catch(function () {
      return undefined
    })
}

function openLocaleDb() {
  return new Promise(function (resolve, reject) {
    const request = indexedDB.open(LOCALE_DB_NAME, 1)
    request.onupgradeneeded = function () {
      if (!request.result.objectStoreNames.contains(LOCALE_STORE)) {
        request.result.createObjectStore(LOCALE_STORE)
      }
    }
    request.onsuccess = function () {
      resolve(request.result)
    }
    request.onerror = function () {
      reject(request.error)
    }
  })
}

const FA_TITLES = {
  'Low fuel': 'سوخت کم',
  'High tank resistance': 'مقاومت بالای مخزن',
  'Stale telemetry': 'تله‌متری قدیمی',
}

const FA_PROBES = {
  'Tank to ground': 'مخزن به زمین',
  'Tank to nozzle': 'مخزن به نازل',
  'Ground to vehicle': 'زمین به خودرو',
}

const LOW_FUEL_BODY =
  /^Remaining fuel is (\d+(?:\.\d+)?)% \((\d+(?:\.\d+)?) L\), below (\d+(?:\.\d+)?)%\.$/

const RESISTANCE_LINE =
  /^(Tank to ground|Tank to nozzle|Ground to vehicle) is (\d+(?:\.\d+)?) Ω, above the (\d+(?:\.\d+)?) Ω limit\.$/

const OPEN_RESISTANCE_LINE =
  /^(Tank to ground|Tank to nozzle|Ground to vehicle): Open line\.$/

const STALE_BODY =
  /^The device sample is about (\d+) minutes old \(limit (\d+) minutes\)\.$/

function localizeFaAlert(title, body) {
  const match =
    /^(Low fuel|High tank resistance|Stale telemetry)(?: \u2014 (.+))?$/.exec(
      title.trim(),
    )
  if (!match || !FA_TITLES[match[1]]) {
    return null
  }

  const localizedBody = localizeFaBody(match[1], body.trim())
  if (!localizedBody) {
    return null
  }

  const localizedTitle = FA_TITLES[match[1]]
  const plate = match[2]
  return {
    title: plate ? `${localizedTitle} \u2014 ${plate}` : localizedTitle,
    body: localizedBody,
  }
}

function localizeFaBody(title, body) {
  if (title === 'Low fuel') {
    const match = LOW_FUEL_BODY.exec(body)
    if (!match) {
      return null
    }

    return `سوخت باقیمانده ${formatPercent(match[1])} (${formatVolume(match[2])}) است و از ${formatPercent(match[3])} کمتر است.`
  }

  if (title === 'High tank resistance') {
    const lines = body.split('\n').map(function localizeLine(line) {
      const openLine = OPEN_RESISTANCE_LINE.exec(line)
      if (openLine && FA_PROBES[openLine[1]]) {
        return `${FA_PROBES[openLine[1]]}: قطع همبندی.`
      }

      const match = RESISTANCE_LINE.exec(line)
      if (!match || !FA_PROBES[match[1]]) {
        return null
      }

      return `مقاومت ${FA_PROBES[match[1]]} برابر ${formatOhms(match[2])} است و از حد ${formatOhms(match[3])} بیشتر است.`
    })
    if (lines.some((line) => line == null)) {
      return null
    }

    return lines.join('\n')
  }

  const match = STALE_BODY.exec(body)
  if (!match) {
    return null
  }

  return `نمونه دستگاه حدود ${formatAmount(Number(match[1]), 'fa')} دقیقه قبل ثبت شده است (حد مجاز ${formatAmount(Number(match[2]), 'fa')} دقیقه).`
}

function formatPercent(raw) {
  return new Intl.NumberFormat('fa', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(Number(raw) / 100)
}

function formatVolume(raw) {
  return `${formatAmount(Number(raw), 'fa')} لیتر`
}

function formatOhms(raw) {
  return `${formatAmount(Number(raw), 'fa')} Ω`
}

function formatAmount(value, locale) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value)
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
