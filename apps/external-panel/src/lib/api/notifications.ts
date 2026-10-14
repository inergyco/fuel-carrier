import type {
  CompanyNotification,
  NotificationReadAllResult,
  NotificationUnreadCount,
  PaginatedResult,
} from '@fuel-carrier/shared-types'
import { api } from '@fuel-carrier/web-ui/api'

export const COMPANY_NOTIFICATION_INBOX_LIMIT = 20
export const NOTIFICATION_POLL_MS = 20_000

export const companyNotificationKeys = {
  all: ['company-notifications'] as const,
  inbox: [
    'company-notifications',
    'inbox',
    COMPANY_NOTIFICATION_INBOX_LIMIT,
  ] as const,
  unreadCount: ['company-notifications', 'unread-count'] as const,
}

export const fetchCompanyNotifications = (
  page: number,
): Promise<PaginatedResult<CompanyNotification>> =>
  api
    .get('notifications', {
      searchParams: {
        page,
        limit: COMPANY_NOTIFICATION_INBOX_LIMIT,
      },
    })
    .json<PaginatedResult<CompanyNotification>>()

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
