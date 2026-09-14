import { createFileRoute } from '@tanstack/react-router'
import { parsePaginationSearch } from '@fuel-carrier/web-ui/ui'
import { CompanyUsersSection } from '../../components/companies/detail/CompanyUsersSection'

export const Route = createFileRoute(
  '/_authenticated/companies/$companyId/users',
)({
  validateSearch: parsePaginationSearch,
  component: CompanyUsersPage,
})

function CompanyUsersPage() {
  const { companyId } = Route.useParams()

  return <CompanyUsersSection companyId={companyId} />
}
