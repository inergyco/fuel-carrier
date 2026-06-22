import { createFileRoute } from '@tanstack/react-router'
import { CompanyCarsSection } from '../../components/companies/detail/CompanyCarsSection'

export const Route = createFileRoute('/_authenticated/companies/$companyId/cars')({
  component: CompanyCarsPage,
})

function CompanyCarsPage() {
  const { companyId } = Route.useParams()

  return <CompanyCarsSection companyId={companyId} />
}
