import type { BrowserPushPayload } from '@fuel-carrier/shared-types/notification'

export const NOTIFICATION_CLICK_MESSAGE = 'fuel-carrier:notification-click'
export const OPEN_NOTIFICATIONS_PARAM = 'openNotifications'

export type NotificationClickMessage = {
  type: typeof NOTIFICATION_CLICK_MESSAGE
}

export function isNotificationClickMessage(
  value: unknown,
): value is NotificationClickMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === NOTIFICATION_CLICK_MESSAGE
  )
}

export function isBrowserPushPayload(
  value: unknown,
): value is BrowserPushPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'title' in value &&
    typeof value.title === 'string' &&
    value.title.length > 0 &&
    'body' in value &&
    typeof value.body === 'string' &&
    'tag' in value &&
    typeof value.tag === 'string'
  )
}
