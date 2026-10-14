import type {
  CompanyNotification,
  NotificationReadAllResult,
  NotificationUnreadCount,
  PaginatedResult,
  PaginationParams,
} from '@fuel-carrier/shared-types'
import { api } from '@fuel-carrier/web-ui/api'

export const COMPANY_NOTIFICATION_INBOX_LIMIT = 20
export const NOTIFICATION_POLL_MS = 20_000

export type CompanyNotificationListParams = PaginationParams

const inboxParams: CompanyNotificationListParams = {
  page: 1,
  limit: COMPANY_NOTIFICATION_INBOX_LIMIT,
}

export const companyNotificationKeys = {
  all: ['company-notifications'] as const,
  inbox: ['company-notifications', 'inbox', inboxParams] as const,
  unreadCount: ['company-notifications', 'unread-count'] as const,
}

export async function fetchCompanyNotifications(): Promise<
  PaginatedResult<CompanyNotification>
> {
  return api
    .get('notifications', {
      searchParams: {
        page: inboxParams.page,
        limit: inboxParams.limit,
      },
    })
    .json<PaginatedResult<CompanyNotification>>()
}

export async function fetchUnreadNotificationCount(): Promise<NotificationUnreadCount> {
  return api.get('notifications/unread-count').json<NotificationUnreadCount>()
}

export async function markCompanyNotificationRead(
  id: string,
): Promise<CompanyNotification> {
  return api.post(`notifications/${id}/read`).json<CompanyNotification>()
}

export async function markAllCompanyNotificationsRead(): Promise<NotificationReadAllResult> {
  return api
    .post('notifications/read-all')
    .json<NotificationReadAllResult>()
}
