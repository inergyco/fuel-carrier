import { createFileRoute } from '@tanstack/react-router'
import { CompanyDriversSection } from '../../components/companies/detail/CompanyDriversSection'

export const Route = createFileRoute('/_authenticated/companies/$companyId/drivers')({
  component: CompanyDriversPage,
})

function CompanyDriversPage() {
  const { companyId } = Route.useParams()

  return <CompanyDriversSection companyId={companyId} />
}
