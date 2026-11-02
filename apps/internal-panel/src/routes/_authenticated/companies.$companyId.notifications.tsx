import { createFileRoute } from '@tanstack/react-router'
import { CompanyNotificationsSection } from '../../components/companies/detail/CompanyNotificationsSection'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/notifications',
)({
  component: CompanyNotificationsPage,
})

function CompanyNotificationsPage() {
  const { companyId } = Route.useParams()

  return <CompanyNotificationsSection companyId={companyId} />
}
