import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '../../components/notifications/NotificationsPage'

export const Route = createFileRoute('/_authenticated/notifications')({
  component: NotificationsRoutePage,
})

function NotificationsRoutePage() {
  return <NotificationsPage />
}
