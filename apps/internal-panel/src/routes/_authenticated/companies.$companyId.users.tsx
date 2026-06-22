import { createFileRoute } from '@tanstack/react-router'
import { CompanyUsersSection } from '../../components/companies/detail/CompanyUsersSection'

export const Route = createFileRoute('/_authenticated/companies/$companyId/users')({
  component: CompanyUsersPage,
})

function CompanyUsersPage() {
  const { companyId } = Route.useParams()

  return <CompanyUsersSection companyId={companyId} />
}
