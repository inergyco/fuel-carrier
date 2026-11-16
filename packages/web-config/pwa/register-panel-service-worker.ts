import { registerSW } from 'virtual:pwa-register'

/** How often open tabs re-check for a newly deployed service worker. */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

/**
 * Registers the panel PWA service worker so deploys replace precaches promptly.
 *
 * Requires `registerType: 'autoUpdate'` in `createPanelViteConfig` — a new worker
 * activates immediately and reloads open clients once it takes control.
 */
export function registerPanelServiceWorker() {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) {
        return
      }

      scheduleServiceWorkerUpdateChecks(registration)
    },
  })
}

function scheduleServiceWorkerUpdateChecks(
  registration: ServiceWorkerRegistration,
) {
  function checkForUpdate() {
    void registration.update()
  }

  window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS)

  document.addEventListener('visibilitychange', function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      checkForUpdate()
    }
  })
}
