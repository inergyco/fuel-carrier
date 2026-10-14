import type {
  NotificationBroadcast,
  PaginatedResult,
  PaginationParams,
} from '@fuel-carrier/shared-types'
import { DEFAULT_LIMIT } from '@fuel-carrier/shared-types'
import type { SendNotificationDto } from '@fuel-carrier/shared-types/notification'
import { api } from '@fuel-carrier/web-ui/api'

export type NotificationListParams = PaginationParams

const DEFAULT_LIST_PARAMS: NotificationListParams = {
  page: 1,
  limit: DEFAULT_LIMIT,
}

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: NotificationListParams = DEFAULT_LIST_PARAMS) =>
    ['notifications', 'list', params] as const,
}

export async function fetchNotifications(
  params: NotificationListParams = DEFAULT_LIST_PARAMS,
): Promise<PaginatedResult<NotificationBroadcast>> {
  return api
    .get('notifications', {
      searchParams: {
        page: params.page,
        limit: params.limit,
      },
    })
    .json<PaginatedResult<NotificationBroadcast>>()
}

export async function sendNotification(
  body: SendNotificationDto,
): Promise<NotificationBroadcast> {
  return api.post('notifications', { json: body }).json<NotificationBroadcast>()
}
